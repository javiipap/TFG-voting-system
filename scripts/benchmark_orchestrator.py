#!/usr/bin/env python3
"""
Benchmark Orchestrator — One chain config = one run.

Receives a list of chain configurations, each defining slot time, gas limit,
scale points, repetitions, and worker count. For every iteration the chain is
redeployed. Results are persisted per-iteration so partial runs can be resumed
or reconstructed after connection loss.

DNS failsafe: exits immediately if e3vote-worker02.iaas.ull.es cannot be resolved.

Usage:
    python3 benchmark_orchestrator.py [--config orchestrator.config.json]
"""
import json
import os
import re
import socket
import subprocess
import sys
import time
import requests
from datetime import datetime


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ETHEREUM_DIR = os.path.abspath(
    os.path.join(SCRIPT_DIR, '../../infra/ethereum'))
CONFIG_PRYSM = os.path.join(ETHEREUM_DIR, 'config-prysm.yml')
GENESIS_IN = os.path.join(ETHEREUM_DIR, 'genesis-in.json')
REDEPLOY_SH = os.path.join(ETHEREUM_DIR, 'redeploy.sh')
BENCHMARK_RUNNER = os.path.join(SCRIPT_DIR, 'benchmark_runner.py')

DNS_CHECK_HOST = "e3vote-worker02.iaas.ull.es"


def dns_check():
    """Exit with failure if DNS cannot resolve the worker host."""
    try:
        socket.getaddrinfo(DNS_CHECK_HOST, None)
    except socket.gaierror:
        print(f"FATAL: DNS resolution failed for {DNS_CHECK_HOST}. Exiting.")
        sys.exit(1)


def load_config(path):
    with open(path) as f:
        return json.load(f)


def set_slot_time(seconds):
    with open(CONFIG_PRYSM) as f:
        content = f.read()
    content = re.sub(r'SECONDS_PER_SLOT:\s*\d+',
                     f'SECONDS_PER_SLOT: {seconds}', content)
    with open(CONFIG_PRYSM, 'w') as f:
        f.write(content)


def set_gas_limit(gas_limit):
    with open(GENESIS_IN) as f:
        genesis = json.load(f)
    genesis['gasLimit'] = hex(gas_limit)
    with open(GENESIS_IN, 'w') as f:
        json.dump(genesis, f, indent=2)


def redeploy():
    print("    Running redeploy.sh...")
    result = subprocess.run(['bash', REDEPLOY_SH], cwd=ETHEREUM_DIR)
    return result.returncode == 0


def wait_for_chain(rpc_endpoint, timeout):
    print(f"    Waiting for chain (timeout={timeout}s)...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = requests.post(rpc_endpoint, json={
                "jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1
            }, timeout=5)
            block = int(resp.json()['result'], 16)
            if block >= 2:
                print(f"    Chain ready at block {block}")
                return True
        except Exception:
            pass
        time.sleep(5)
    print("    ERROR: Chain did not become ready in time")
    return False


def sync_nonces(web_addr):
    print("    Syncing DB nonces...")
    try:
        resp = requests.post(
            f"{web_addr}/api/testing/sync-nonces", timeout=30, verify=False)
        if resp.status_code == 200:
            print("    Nonces synchronized")
            return True
        print(f"    ERROR: sync-nonces returned HTTP {resp.status_code}")
    except Exception as e:
        print(f"    ERROR: sync-nonces failed: {e}")
    return False


def run_benchmark(output_dir, extra_args):
    cmd = [sys.executable, BENCHMARK_RUNNER,
           '--output-dir', output_dir, '--no-timestamp-dir'] + extra_args
    print(f"    Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd='/'.join(SCRIPT_DIR.split('/')[:-1]))
    return result.returncode == 0


def persist_iteration_result(run_dir, iteration_idx, result):
    """Write a single iteration result to disk immediately."""
    path = os.path.join(run_dir, f'iteration_{iteration_idx:03d}.json')
    with open(path, 'w') as f:
        json.dump(result, f, indent=2)


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Benchmark Orchestrator')
    parser.add_argument('--config', type=str, required=True,
                        help='Path to orchestrator config JSON')
    args = parser.parse_args()

    # DNS failsafe
    dns_check()

    config = load_config(args.config)
    chains = config['chains']
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    base_output = os.path.join(
        SCRIPT_DIR, 'benchmarks', f'orchestrator_{timestamp}')
    os.makedirs(base_output, exist_ok=True)

    # Persist orchestrator config for reproducibility
    with open(os.path.join(base_output, 'orchestrator_config.json'), 'w') as f:
        json.dump(config, f, indent=2)

    print(f"=== Benchmark Orchestrator ===")
    print(f"  Chains: {len(chains)}")
    print(f"  Output: {base_output}")
    print()

    for chain_idx, chain in enumerate(chains):
        slot_time = chain['slotTime']
        gas_limit = chain['gasLimit']
        iterations = chain['iterations']
        scale_point = chain['scalePoint']
        chain_ready_timeout = chain.get('chainReadyTimeout', 180)
        rpc_endpoint = chain.get('rpcEndpoint', config.get(
            'rpcEndpoint', 'http://e3vote-worker02.iaas.ull.es:30545'))
        web_addr = chain.get('webAddr', config.get(
            'webAddr', 'http://localhost:3000'))
        benchmark_args = ['--scale-points',
                          str(scale_point), '--repetitions', '1']
        label = f"slot{slot_time}s_gas{gas_limit // 1_000_000}M_sp{scale_point}"
        run_dir = os.path.join(base_output, label)
        os.makedirs(run_dir, exist_ok=True)

        print(
            f"[{chain_idx+1}/{len(chains)}] Chain: {label} — {iterations} iterations")

        # Apply chain config once (slot time + gas limit)
        set_slot_time(slot_time)
        set_gas_limit(gas_limit)

        for it in range(iterations):
            print(f"  Iteration {it+1}/{iterations}")

            # DNS check before each iteration
            dns_check()

            # Redeploy chain
            if not redeploy():
                persist_iteration_result(run_dir, it, {
                    'iteration': it, 'status': 'redeploy_failed'})
                print(f"    FAILED: redeploy")
                continue

            # Wait for chain readiness
            if not wait_for_chain(rpc_endpoint, chain_ready_timeout):
                persist_iteration_result(run_dir, it, {
                    'iteration': it, 'status': 'chain_timeout'})
                continue

            # Sync nonces
            if not sync_nonces(web_addr):
                persist_iteration_result(run_dir, it, {
                    'iteration': it, 'status': 'sync_nonces_failed'})
                continue

            # Run benchmark
            iter_output = os.path.join(run_dir, f'iter_{it:03d}')
            success = run_benchmark(iter_output, benchmark_args)
            persist_iteration_result(run_dir, it, {
                'iteration': it,
                'status': 'success' if success else 'benchmark_failed',
                'output_dir': iter_output,
            })
            print(f"    {'SUCCESS' if success else 'FAILED'}")

        print()

    # Write summary
    summary = {'timestamp': timestamp, 'chains': []}
    for chain_idx, chain in enumerate(chains):
        label = f"slot{chain['slotTime']}s_gas{chain['gasLimit'] // 1_000_000}M_sp{chain['scalePoint']}"
        run_dir = os.path.join(base_output, label)
        iter_results = []
        for it in range(chain['iterations']):
            path = os.path.join(run_dir, f'iteration_{it:03d}.json')
            if os.path.exists(path):
                with open(path) as f:
                    iter_results.append(json.load(f))
        summary['chains'].append(
            {'label': label, 'config': chain, 'iterations': iter_results})

    with open(os.path.join(base_output, 'summary.json'), 'w') as f:
        json.dump(summary, f, indent=2)

    print(f"=== Orchestrator complete. Output: {base_output} ===")


if __name__ == '__main__':
    main()
