#!/usr/bin/env python3
"""
e3vote Benchmark Runner — Multi-scale, multi-repetition orchestrator.

Usage:
    python3 benchmark_runner.py [--scale-points 100 500 1000] [--repetitions 5] [--output-dir benchmarks]
"""
import subprocess
import sys
import time
import json
import os
import math
import argparse
import shutil
import requests
from datetime import datetime


def load_config(config_path):
    with open(config_path, 'r') as f:
        return json.load(f)


def detect_slot_time(rpc_endpoint):
    """Detect block slot time by comparing timestamps of two consecutive blocks."""
    try:
        resp = requests.post(rpc_endpoint, json={
            "jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1
        }, timeout=10)
        latest = int(resp.json()['result'], 16)

        timestamps = []
        for block_num in [latest - 1, latest]:
            resp = requests.post(rpc_endpoint, json={
                "jsonrpc": "2.0", "method": "eth_getBlockByNumber",
                "params": [hex(block_num), False], "id": 1
            }, timeout=10)
            timestamps.append(int(resp.json()['result']['timestamp'], 16))

        slot_time = timestamps[1] - timestamps[0]
        if slot_time > 0:
            return slot_time
    except Exception as e:
        print(f"  Warning: could not detect slot time: {e}")
    return 2  # fallback


def deploy_contract(config, max_retries=3):
    """Deploy a fresh election contract via the web API."""
    url = f"{config['webAddr']}/api/testing/create-election"
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, json={'candidateCount': config['candidateCount']},
                                 headers={'Content-Type': 'application/json'}, verify=False)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    'publicKey': data['masterPublicKey'],
                    'privateKey': data['elgamalPrivate'],
                    'contractAddr': data['contractAddr'],
                    'electionId': data['id'],
                }
            print(
                f"  Deploy attempt {attempt+1} failed: HTTP {resp.status_code}")
        except Exception as e:
            print(f"  Deploy attempt {attempt+1} error: {e}")
        time.sleep(1)
    raise RuntimeError(f"Contract deploy failed after {max_retries} attempts")


def split_into_batches(items, num_batches):
    k, m = divmod(len(items), num_batches)
    return [items[i*k + min(i, m):(i+1)*k + min(i+1, m)] for i in range(num_batches)]


def spawn_worker(cmd, out_file):
    """Spawn a subprocess, redirect stdout/stderr to files. Returns Popen."""
    f_out = open(out_file, 'w')
    f_err = open(out_file + '.err', 'w')
    p = subprocess.Popen(cmd, stdout=f_out, stderr=f_err,
                         stdin=subprocess.DEVNULL, start_new_session=True)
    p._bench_files = (f_out, f_err)
    return p


def wait_and_close(procs):
    for i, p in enumerate(procs):
        p.wait()
        for f in p._bench_files:
            f.close()


def collect_json_results(out_dir, num_workers, prefix):
    """Read and merge JSON results from worker output files."""
    results = []
    failures = []
    for i in range(1, num_workers + 1):
        path = f'{out_dir}/{prefix}_{i}'
        try:
            with open(path, 'r') as f:
                content = f.read().strip()
                if not content:
                    continue
                parsed = json.loads(content)
                if not isinstance(parsed, list):
                    parsed = [parsed]
                for entry in parsed:
                    if isinstance(entry, dict) and entry.get('status') in ('error', 'rejected'):
                        failures.append(entry)
                    else:
                        results.append(entry)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            failures.append(
                {'status': 'error', 'failedPhase': 'parse', 'error': str(e), 'worker': i})
    return results, failures


def query_block_range(vote_results, rpc_endpoint, slot_time=2):
    """Query chain for block-level data in the vote window."""
    block_numbers = [int(r['blockNumber'])
                     for r in vote_results if r.get('blockNumber')]
    if not block_numbers:
        return None

    min_block, max_block = min(block_numbers), max(block_numbers)
    blocks = []

    for block_num in range(min_block, max_block + 1):
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_getBlockByNumber",
            "params": [hex(block_num), False],
            "id": 1,
        }
        try:
            resp = requests.post(rpc_endpoint, json=payload, timeout=10)
            block = resp.json().get('result')
            if block:
                blocks.append({
                    'number': block_num,
                    'gasUsed': int(block['gasUsed'], 16),
                    'gasLimit': int(block['gasLimit'], 16),
                    'timestamp': int(block['timestamp'], 16),
                    'txCount': len(block.get('transactions', [])),
                })
        except Exception as e:
            print(f"    Warning: failed to fetch block {block_num}: {e}")

    if len(blocks) < 2:
        # All votes in a single block — use slot time as the time span
        tps = len(block_numbers) / slot_time if block_numbers else 0
        return {'blocks': blocks, 'tps': tps, 'avgVotesPerBlock': len(block_numbers), 'avgGasUtil': blocks[0]['gasUsed'] / blocks[0]['gasLimit'] if blocks else 0, 'blockRange': [min_block, max_block], 'timeSpanS': slot_time}

    time_span = blocks[-1]['timestamp'] - blocks[0]['timestamp']
    successful_votes = len(block_numbers)
    tps = successful_votes / time_span if time_span > 0 else 0
    avg_votes_per_block = successful_votes / len(blocks)
    avg_gas_util = sum(b['gasUsed'] / b['gasLimit']
                       for b in blocks) / len(blocks)

    return {
        'blocks': blocks,
        'tps': tps,
        'avgVotesPerBlock': avg_votes_per_block,
        'avgGasUtil': avg_gas_util,
        'blockRange': [min_block, max_block],
        'timeSpanS': time_span,
    }


def run_single_iteration(scale_point, rep_index, config, output_dir, endpoints, slot_time=2):
    """Execute one full iteration: deploy → credentials → voting. Returns result dict."""
    iter_dir = os.path.join(output_dir, f'sp{scale_point}_rep{rep_index}')
    os.makedirs(iter_dir, exist_ok=True)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    num_workers = min(config['numWorkers'], scale_point)

    # 1. Deploy contract
    t0 = time.time()
    contract = deploy_contract(config)
    deploy_time = time.time() - t0
    print(
        f"    Deploy: {deploy_time:.2f}s (contract={contract['contractAddr']})")

    # 2. Generate credentials
    t0 = time.time()
    batch_sizes = []
    base, remainder = divmod(scale_point, num_workers)
    for i in range(num_workers):
        bs = base + (1 if i < remainder else 0)
        if bs > 0:
            batch_sizes.append(bs)
    actual_cred_workers = len(batch_sizes)

    procs = []
    for i, bs in enumerate(batch_sizes):
        endpoint = endpoints[i % len(endpoints)]
        fallbacks = [e for e in endpoints if e != endpoint]
        cmd = ['npx', 'tsx', os.path.join(script_dir, 'generate-credentials.ts'),
               str(contract['electionId']), str(bs), endpoint, json.dumps(fallbacks)]
        out_file = f'{iter_dir}/cred_worker_{i+1}'
        procs.append(spawn_worker(cmd, out_file))
    wait_and_close(procs)

    cred_results, cred_failures = collect_json_results(
        iter_dir, actual_cred_workers, 'cred_worker')
    cred_time = time.time() - t0
    print(
        f"    Credentials: {cred_time:.2f}s ({len(cred_results)} ok, {len(cred_failures)} failed)")

    if not cred_results:
        return {
            'deployTimeS': deploy_time, 'credTimeS': cred_time, 'prepTimeS': 0, 'voteTimeS': 0,
            'credResults': cred_results, 'credFailures': cred_failures,
            'presignResults': [], 'presignFailures': [],
            'voteResults': [], 'voteFailures': [],
        }

    # 3. Presign votes (preparation phase: grant + encrypt + sign)
    t0 = time.time()
    actual_presign_workers = min(num_workers, len(cred_results))
    batches = split_into_batches(cred_results, actual_presign_workers)

    procs = []
    for i, batch in enumerate(batches):
        batch_file = f'{iter_dir}/presign_batch_{i+1}.json'
        with open(batch_file, 'w') as f:
            json.dump(batch, f)
        endpoint = endpoints[i % len(endpoints)]
        fallbacks = [e for e in endpoints if e != endpoint]
        cmd = ['npx', 'tsx', os.path.join(script_dir, 'presign-votes.ts'),
               contract['publicKey'], contract['contractAddr'],
               str(config['candidateCount']), batch_file, endpoint, json.dumps(fallbacks)]
        out_file = f'{iter_dir}/presign_worker_{i+1}'
        procs.append(spawn_worker(cmd, out_file))
    wait_and_close(procs)

    presign_results, presign_failures = collect_json_results(
        iter_dir, actual_presign_workers, 'presign_worker')
    prep_time = time.time() - t0
    print(
        f"    Presign: {prep_time:.2f}s ({len(presign_results)} ok, {len(presign_failures)} failed)")

    if not presign_results:
        return {
            'contract': contract,
            'deployTimeS': deploy_time, 'credTimeS': cred_time, 'prepTimeS': prep_time, 'voteTimeS': 0,
            'credResults': cred_results, 'credFailures': cred_failures,
            'presignResults': presign_results, 'presignFailures': presign_failures,
            'voteResults': [], 'voteFailures': [],
        }

    # 4. Emit votes (emission phase: submit pre-signed transactions)
    t0 = time.time()
    signed_txs = [{'rawTx': r['rawTx'], 'voterAddress': r['voterAddress']}
                  for r in presign_results if r.get('rawTx')]
    actual_emit_workers = min(num_workers, len(signed_txs))
    emit_batches = split_into_batches(signed_txs, actual_emit_workers)

    procs = []
    for i, batch in enumerate(emit_batches):
        batch_file = f'{iter_dir}/emit_batch_{i+1}.json'
        with open(batch_file, 'w') as f:
            json.dump(batch, f)
        endpoint = endpoints[i % len(endpoints)]
        fallbacks = [e for e in endpoints if e != endpoint]
        cmd = ['npx', 'tsx', os.path.join(script_dir, 'emit-votes.ts'),
               batch_file, endpoint, json.dumps(fallbacks)]
        out_file = f'{iter_dir}/emit_worker_{i+1}'
        procs.append(spawn_worker(cmd, out_file))
    wait_and_close(procs)

    vote_results, vote_failures = collect_json_results(
        iter_dir, actual_emit_workers, 'emit_worker')
    vote_time = time.time() - t0
    print(
        f"    Emit: {vote_time:.2f}s ({len(vote_results)} ok, {len(vote_failures)} failed)")

    # 5. Query block-level data
    block_data = query_block_range(vote_results, endpoints[0], slot_time)
    if block_data and block_data.get('tps'):
        print(
            f"    Throughput: {block_data['tps']:.2f} TPS, {block_data['avgVotesPerBlock']:.1f} votes/block, {block_data['avgGasUtil']:.1%} gas util")

    # 6. Merge presign and emit results by voterAddress
    presign_by_addr = {r['voterAddress']
        : r for r in presign_results if r.get('voterAddress')}
    merged_results = []
    for v in vote_results:
        addr = v.get('voterAddress', '')
        p = presign_by_addr.get(addr, {})
        merged_results.append({
            'voterAddress': addr,
            'grantTime': p.get('grantTime'),
            'encryptTime': p.get('encryptTime'),
            'latencyMs': v.get('latencyMs'),
            'inclusionDelayMs': v.get('inclusionDelayMs'),
            'gas': v.get('gas'),
            'blockNumber': v.get('blockNumber'),
            'status': v.get('status', 'fulfilled'),
        })

    return {
        'contract': contract,
        'deployTimeS': deploy_time,
        'credTimeS': cred_time,
        'prepTimeS': prep_time,
        'voteTimeS': vote_time,
        'credResults': cred_results,
        'credFailures': cred_failures,
        'presignResults': presign_results,
        'presignFailures': presign_failures,
        'voteResults': merged_results,
        'voteFailures': vote_failures,
        'blockData': block_data,
    }


def parse_args():
    parser = argparse.ArgumentParser(description='e3vote Benchmark Runner')
    parser.add_argument('--scale-points', type=int, nargs='+',
                        help='Override scale points from config')
    parser.add_argument('--repetitions', type=int,
                        help='Override repetitions from config')
    parser.add_argument('--output-dir', type=str,
                        help='Override output directory from config')
    parser.add_argument('--config', type=str, default=None,
                        help='Path to config file')
    return parser.parse_args()


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    args = parse_args()

    config_path = args.config or os.path.join(
        script_dir, 'benchmark.config.json')
    config = load_config(config_path)

    # Apply CLI overrides
    if args.scale_points:
        config['scalePoints'] = args.scale_points
    if args.repetitions:
        config['repetitions'] = args.repetitions
    if args.output_dir:
        config['outputDir'] = args.output_dir

    # Create timestamped output directory
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_dir = os.path.join(
        script_dir, config['outputDir'], f'run_{timestamp}')
    os.makedirs(output_dir, exist_ok=True)

    # Copy config for reproducibility
    shutil.copy2(config_path, os.path.join(output_dir, 'config.json'))

    print(f"=== e3vote Benchmark Runner ===")
    print(f"  Scale points: {config['scalePoints']}")
    print(f"  Repetitions:  {config['repetitions']}")
    print(f"  Candidates:   {config['candidateCount']}")
    print(f"  Workers:      {config['numWorkers']}")
    print(f"  RPC endpoints:{config['rpcEndpoints']}")
    print(f"  Output:       {output_dir}")
    print()

    endpoints = config['rpcEndpoints']

    # Detect chain slot time
    slot_time = detect_slot_time(endpoints[0])
    print(f"  Slot time:    {slot_time}s (detected from chain)")

    # Main execution loop
    all_scale_results = []
    for scale_point in config['scalePoints']:
        print(f"\n{'='*60}")
        print(f"=== Scale point: {scale_point} voters ===")
        print(f"{'='*60}")
        scale_reps = []
        for rep in range(config['repetitions']):
            if rep > 0:
                print(
                    f'Graceful wait for chain stabilization ({slot_time * 2} sec)')
                time.sleep(slot_time * 2)

            print(f"\n  --- Repetition {rep+1}/{config['repetitions']} ---")
            result = run_single_iteration(
                scale_point, rep, config, output_dir, endpoints, slot_time)
            scale_reps.append(result)

        aggregated = compute_aggregated_stats(scale_reps)
        all_scale_results.append({
            'voters': scale_point,
            'repetitions': scale_reps,
            'aggregated': aggregated,
        })
        print(
            f"\n  Aggregated TPS: {aggregated.get('tps', {}).get('mean', 0):.2f} ± {aggregated.get('tps', {}).get('ci95', 0):.2f}")

    # Write outputs
    write_outputs(all_scale_results, config, output_dir, slot_time)
    print(f"\n=== Benchmark complete. Results in {output_dir} ===")


def compute_stats(values):
    """Compute mean, std, min, max, 95% CI for a list of values."""
    if not values:
        return {'mean': 0, 'std': 0, 'min': 0, 'max': 0, 'ci95': 0, 'count': 0}
    n = len(values)
    mean = sum(values) / n
    if n < 2:
        return {'mean': mean, 'std': 0, 'min': mean, 'max': mean, 'ci95': 0, 'count': n}
    std = (sum((x - mean)**2 for x in values) / (n - 1)) ** 0.5
    ci95 = 1.96 * std / n**0.5
    return {'mean': mean, 'std': std, 'min': min(values), 'max': max(values), 'ci95': ci95, 'count': n}


def compute_aggregated_stats(scale_reps):
    """Aggregate timing metrics across repetitions for a scale point."""
    agg = {}

    # TPS from block data
    tps_values = [r['blockData']['tps'] for r in scale_reps if r.get(
        'blockData') and r['blockData'].get('tps')]
    if tps_values:
        agg['tps'] = compute_stats(tps_values)

    # Latency (emission time per vote, mean per rep)
    latency_means = []
    for r in scale_reps:
        times = [v.get('latencyMs', 0)
                 for v in r.get('voteResults', []) if v.get('latencyMs')]
        if times:
            latency_means.append(sum(times) / len(times))
    if latency_means:
        agg['latencyMs'] = compute_stats(latency_means)

    # Grant time (mean per rep)
    grant_means = []
    for r in scale_reps:
        times = [v.get('grantTime', 0)
                 for v in r.get('voteResults', []) if v.get('grantTime')]
        if times:
            grant_means.append(sum(times) / len(times))
    if grant_means:
        agg['grantTime'] = compute_stats(grant_means)

    # Encrypt time (mean per rep)
    encrypt_means = []
    for r in scale_reps:
        times = [v.get('encryptTime', 0)
                 for v in r.get('voteResults', []) if v.get('encryptTime')]
        if times:
            encrypt_means.append(sum(times) / len(times))
    if encrypt_means:
        agg['encryptTime'] = compute_stats(encrypt_means)

    # Inclusion delay (mean per rep)
    delay_means = []
    for r in scale_reps:
        times = [v.get('inclusionDelayMs', 0) for v in r.get(
            'voteResults', []) if v.get('inclusionDelayMs')]
        if times:
            delay_means.append(sum(times) / len(times))
    if delay_means:
        agg['inclusionDelay'] = compute_stats(delay_means)

    # Prep time (wall clock per rep)
    prep_times = [r['prepTimeS'] for r in scale_reps if r.get('prepTimeS')]
    if prep_times:
        agg['prepTime'] = compute_stats(prep_times)

    # Failure summary
    total = sum(len(r.get('voteResults', [])) +
                len(r.get('voteFailures', [])) for r in scale_reps)
    successes = sum(len(r.get('voteResults', [])) for r in scale_reps)
    failures = sum(len(r.get('voteFailures', [])) for r in scale_reps)
    presign_failures = sum(len(r.get('presignFailures', []))
                           for r in scale_reps)
    by_phase = {}
    for r in scale_reps:
        for f in r.get('voteFailures', []):
            phase = f.get('errorType', f.get('failedPhase', 'unknown'))
            by_phase[phase] = by_phase.get(phase, 0) + 1
    agg['failures'] = {'total': total, 'successes': successes, 'failures': failures,
                       'presignFailures': presign_failures, 'byPhase': by_phase}

    return agg


def write_outputs(all_scale_results, config, output_dir, slot_time):
    """Write results.json and votes.csv."""
    # Get git commit
    try:
        git_result = subprocess.run(
            ['git', 'rev-parse', 'HEAD'], capture_output=True, text=True, timeout=5)
        git_commit = git_result.stdout.strip() if git_result.returncode == 0 else 'unknown'
    except Exception:
        git_commit = 'unknown'

    # Determine block gas limit from first available block data
    block_gas_limit = 30000000
    for sp in all_scale_results:
        for rep in sp.get('repetitions', []):
            bd = rep.get('blockData')
            if bd and bd.get('blocks'):
                block_gas_limit = bd['blocks'][0]['gasLimit']
                break
        else:
            continue
        break

    # Gas model
    gas_model = {'blockGasLimit': block_gas_limit}
    for sp in all_scale_results:
        for rep in sp.get('repetitions', []):
            vote_gas = [int(v['gas']) for v in rep.get(
                'voteResults', []) if v.get('gas')]
            if vote_gas:
                gas_model['perVoteTxGas'] = sum(vote_gas) // len(vote_gas)
                break
        else:
            continue
        break

    # Build JSON output
    output = {
        'metadata': {
            'timestamp': datetime.now().isoformat(),
            'gitCommit': git_commit,
            'slotTimeS': slot_time,
            'blockGasLimit': block_gas_limit,
            'nodeCount': len(config['rpcEndpoints']),
            'rpcEndpoints': config['rpcEndpoints'],
            'candidateCount': config['candidateCount'],
            'numWorkers': config['numWorkers'],
        },
        'scalePoints': [{
            'voters': sp['voters'],
            'aggregated': sp['aggregated'],
            'repetitions': [{
                'rep': i,
                'deployTimeS': rep['deployTimeS'],
                'credTimeS': rep['credTimeS'],
                'prepTimeS': rep.get('prepTimeS', 0),
                'voteTimeS': rep['voteTimeS'],
                'successes': len(rep.get('voteResults', [])),
                'failures': len(rep.get('voteFailures', [])),
                'presignFailures': len(rep.get('presignFailures', [])),
                'throughput': {
                    'tps': rep.get('blockData', {}).get('tps', 0),
                    'avgVotesPerBlock': rep.get('blockData', {}).get('avgVotesPerBlock', 0),
                    'avgGasUtil': rep.get('blockData', {}).get('avgGasUtil', 0),
                } if rep.get('blockData') else None,
                'failureDetails': rep.get('voteFailures', []),
            } for i, rep in enumerate(sp['repetitions'])]
        } for sp in all_scale_results],
        'gasModel': gas_model,
    }

    with open(os.path.join(output_dir, 'results.json'), 'w') as f:
        json.dump(output, f, indent=2)

    # Write CSV
    csv_path = os.path.join(output_dir, 'votes.csv')
    with open(csv_path, 'w') as f:
        f.write('scale_point,repetition,vote_id,voter_address,encrypt_time_ms,grant_time_ms,inclusion_delay_ms,casting_time_ms,gas_used,block_number,status,error_phase,error_message\n')
        for sp in all_scale_results:
            for rep_idx, rep in enumerate(sp['repetitions']):
                for vid, v in enumerate(rep.get('voteResults', [])):
                    f.write(f"{sp['voters']},{rep_idx},{vid},"
                            f"{v.get('voterAddress', '')},"
                            f"{v.get('encryptTime', '')},"
                            f"{v.get('grantTime', '')},"
                            f"{v.get('inclusionDelayMs', '')},"
                            f"{v.get('latencyMs', '')},"
                            f"{v.get('gas', '')},"
                            f"{v.get('blockNumber', '')},"
                            f"success,,\n")
                for vid, v in enumerate(rep.get('voteFailures', [])):
                    f.write(f"{sp['voters']},{rep_idx},{vid},"
                            f"{v.get('voterAddress', '')},"
                            f",,,,,,failed,"
                            f"{v.get('failedPhase', v.get('errorType', ''))},"
                            f"\"{v.get('error', '').replace(chr(34), chr(34)+chr(34))}\"\n")

    print(f"  Written: {os.path.join(output_dir, 'results.json')}")
    print(f"  Written: {csv_path}")


if __name__ == '__main__':
    main()
