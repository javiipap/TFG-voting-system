#!/usr/bin/env python3
"""
Benchmark Orchestrator — Iterates over slot time and gas limit configurations,
redeploys the blockchain, and runs benchmark_runner.py for each combination.

Usage:
    python3 benchmark_orchestrator.py [--config orchestrator.config.json]
"""
import json
import os
import re
import subprocess
import sys
import time
import requests
from datetime import datetime


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ETHEREUM_DIR = os.path.abspath(os.path.join(
    SCRIPT_DIR, '../../infra/ethereum'))
CONFIG_PRYSM = os.path.join(ETHEREUM_DIR, 'config-prysm.yml')
GENESIS_IN = os.path.join(ETHEREUM_DIR, 'genesis-in.json')
REDEPLOY_SH = os.path.join(ETHEREUM_DIR, 'redeploy.sh')
BENCHMARK_RUNNER = os.path.join(SCRIPT_DIR, 'benchmark_runner.py')

DEFAULT_CONFIG = {
    "slotTimes": [15, ],
    "gasLimits": [600_000_000, 300_000_000, 100_000_000, 60_000_000, 30_000_000],
    "chainReadyTimeout": 180,
    "rpcEndpoint": "http://e3vote-worker02.iaas.ull.es:30545",
    "benchmarkArgs": []
}


def load_config(path):
    if path and os.path.exists(path):
        with open(path) as f:
            cfg = json.load(f)
        # Merge with defaults
        for k, v in DEFAULT_CONFIG.items():
            cfg.setdefault(k, v)
        return cfg
    return DEFAULT_CONFIG.copy()


def set_slot_time(seconds):
    """Modify SECONDS_PER_SLOT in config-prysm.yml."""
    with open(CONFIG_PRYSM) as f:
        content = f.read()
    content = re.sub(r'SECONDS_PER_SLOT:\s*\d+',
                     f'SECONDS_PER_SLOT: {seconds}', content)
    with open(CONFIG_PRYSM, 'w') as f:
        f.write(content)


def set_gas_limit(gas_limit):
    """Modify gasLimit in genesis-in.json (stored as hex)."""
    with open(GENESIS_IN) as f:
        genesis = json.load(f)
    genesis['gasLimit'] = hex(gas_limit)
    with open(GENESIS_IN, 'w') as f:
        json.dump(genesis, f, indent=2)


def redeploy():
    """Run redeploy.sh and return success status."""
    print("  Running redeploy.sh...")
    result = subprocess.run(['bash', REDEPLOY_SH], cwd=ETHEREUM_DIR)
    return result.returncode == 0


def wait_for_chain(rpc_endpoint, timeout):
    """Wait until the chain produces blocks."""
    print(f"  Waiting for chain to be ready (timeout={timeout}s)...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = requests.post(rpc_endpoint, json={
                "jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1
            }, timeout=5)
            block = int(resp.json()['result'], 16)
            if block >= 2:
                print(f"  Chain ready at block {block}")
                return True
        except Exception:
            pass
        time.sleep(5)
    print("  ERROR: Chain did not become ready in time")
    return False


def run_benchmark(output_dir, extra_args):
    """Run benchmark_runner.py with output directed to the given directory."""
    cmd = [sys.executable, BENCHMARK_RUNNER,
           '--output-dir', output_dir] + extra_args
    print(f"  Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=SCRIPT_DIR)
    return result.returncode == 0


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Benchmark Orchestrator')
    parser.add_argument('--config', type=str, default=None,
                        help='Path to orchestrator config JSON')
    args = parser.parse_args()

    config = load_config(args.config)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    base_output = os.path.join(
        SCRIPT_DIR, 'benchmarks', f'orchestrator_{timestamp}')
    os.makedirs(base_output, exist_ok=True)

    # Save orchestrator config
    with open(os.path.join(base_output, 'orchestrator_config.json'), 'w') as f:
        json.dump(config, f, indent=2)

    combinations = [(slot, gas) for slot in config['slotTimes']
                    for gas in config['gasLimits']]
    total = len(combinations)
    results = []

    print(f"=== Benchmark Orchestrator ===")
    print(f"  Slot times: {config['slotTimes']}")
    print(f"  Gas limits: {config['gasLimits']}")
    print(f"  Total combinations: {total}")
    print(f"  Output: {base_output}")
    print()

    for i, (slot_time, gas_limit) in enumerate(combinations, 1):
        label = f"slot{slot_time}s_gas{gas_limit // 1_000_000}M"
        print(
            f"[{i}/{total}] Configuration: slot_time={slot_time}s, gas_limit={gas_limit} ({label})")

        # 1. Modify blockchain config
        set_slot_time(slot_time)
        set_gas_limit(gas_limit)
        print(
            f"  Config updated: SECONDS_PER_SLOT={slot_time}, gasLimit={hex(gas_limit)}")

        # 2. Redeploy
        if not redeploy():
            print(f"  FAILED: redeploy failed for {label}, skipping")
            results.append({'label': label, 'slot_time': slot_time,
                           'gas_limit': gas_limit, 'status': 'redeploy_failed'})
            continue

        # 3. Wait for chain
        if not wait_for_chain(config['rpcEndpoint'], config['chainReadyTimeout']):
            results.append({'label': label, 'slot_time': slot_time,
                           'gas_limit': gas_limit, 'status': 'chain_timeout'})
            continue

        # 4. Run benchmark
        run_output = os.path.join(base_output, label)
        success = run_benchmark(run_output, config['benchmarkArgs'])
        results.append({
            'label': label,
            'slot_time': slot_time,
            'gas_limit': gas_limit,
            'status': 'success' if success else 'benchmark_failed',
            'output_dir': run_output,
        })
        print(f"  {'SUCCESS' if success else 'FAILED'}: {label}")
        print()

    # Write summary
    summary_path = os.path.join(base_output, 'summary.json')
    with open(summary_path, 'w') as f:
        json.dump({'timestamp': timestamp, 'results': results}, f, indent=2)
    print(f"\n=== Orchestrator complete. Summary: {summary_path} ===")


if __name__ == '__main__':
    main()
