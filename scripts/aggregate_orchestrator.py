#!/usr/bin/env python3
"""
Aggregate orchestrator benchmark results from multiple output directories/tar.gz files.

Groups results by (slot_time, gas_limit, vote_count) and computes:
- mean, min, max, stdev, p95, error_rate, tps for each metric
- Outputs aggregated JSON
- Generates heatmap (best gas_limit/slot) and line plots (vote_count on x-axis)

Usage:
    python3 aggregate_orchestrator.py [paths...] [--output-dir OUTPUT]

    paths can be:
      - tar.gz files containing orchestrator_* directories
      - directories containing slot*_gas*_sp*/iter_*/results.json
"""
import argparse
import json
import os
import re
import sys
import tarfile
from collections import defaultdict

import numpy as np

# Regex to parse directory label: slot{X}s_gas{Y}M_sp{Z}
LABEL_RE = re.compile(r'slot(\d+)s_gas(\d+)M_sp(\d+)')


def parse_label(label):
    """Extract (slot_time, gas_limit_millions, scale_point) from label."""
    m = LABEL_RE.match(label)
    if not m:
        return None
    return int(m.group(1)), int(m.group(2)), int(m.group(3))


def compute_stats(values):
    """Compute statistics for a list of numeric values."""
    if not values:
        return None
    a = np.array(values, dtype=float)
    return {
        'mean': float(np.mean(a)),
        'std': float(np.std(a, ddof=1)) if len(a) > 1 else 0.0,
        'min': float(np.min(a)),
        'max': float(np.max(a)),
        'p95': float(np.percentile(a, 95)),
        'count': len(a),
    }


def bucket_gas_limit(gas_limit):
    """Round gas limit to the nearest configured bucket.

    TODO: REMOVE THIS once the orchestrator reports the *configured* gas limit
    rather than the actual blockGasLimit (which drifts slightly per block).
    The actual values cluster around the configured ones (e.g. 302M~308M → 300M).
    """
    buckets = [30_000_000, 100_000_000, 300_000_000, 600_000_000]
    return min(buckets, key=lambda b: abs(b - gas_limit))


def extract_repetition_metrics(results_json):
    """Extract per-repetition metrics from a results.json dict.

    Returns list of dicts, one per (voters, repetition) with flat metrics.
    """
    metadata = results_json.get('metadata', {})
    slot_time = metadata.get('slotTimeS')
    # TODO: use raw gas_limit once orchestrator stores configured value in results
    gas_limit = bucket_gas_limit(metadata.get('blockGasLimit', 0))
    records = []

    for sp in results_json.get('scalePoints', []):
        voters = sp['voters']
        for rep in sp.get('repetitions', []):
            thr = rep.get('throughput', {})
            records.append({
                'slot_time': slot_time,
                'gas_limit': gas_limit,
                'voters': voters,
                'tps': thr.get('tps', 0),
                'avg_votes_per_block': thr.get('avgVotesPerBlock', 0),
                'avg_gas_util': thr.get('avgGasUtil', 0),
                'vote_time_s': rep.get('voteTimeS', 0),
                'successes': rep.get('successes', 0),
                'failures': rep.get('failures', 0),
                'presign_failures': rep.get('presignFailures', 0),
                'deploy_time_s': rep.get('deployTimeS', 0),
                'cred_time_s': rep.get('credTimeS', 0),
                'prep_time_s': rep.get('prepTimeS', 0),
            })
    return records


def collect_from_directory(base_dir):
    """Collect all results.json from an orchestrator output directory."""
    records = []
    for label_dir in sorted(os.listdir(base_dir)):
        if not LABEL_RE.match(label_dir):
            continue
        label_path = os.path.join(base_dir, label_dir)
        if not os.path.isdir(label_path):
            continue
        for iter_dir in sorted(os.listdir(label_path)):
            if not iter_dir.startswith('iter_'):
                continue
            results_path = os.path.join(label_path, iter_dir, 'results.json')
            if os.path.isfile(results_path):
                with open(results_path) as f:
                    try:
                        records.extend(
                            extract_repetition_metrics(json.load(f)))
                    except (json.JSONDecodeError, KeyError) as e:
                        print(
                            f"  WARN: skipping {results_path}: {e}", file=sys.stderr)
    return records


def collect_from_tarball(tar_path):
    """Collect all results.json from a tar.gz file."""
    records = []
    with tarfile.open(tar_path, 'r:gz') as tf:
        for member in tf.getmembers():
            if member.name.endswith('/results.json') and '/iter_' in member.name:
                f = tf.extractfile(member)
                if f:
                    try:
                        data = json.load(f)
                        records.extend(extract_repetition_metrics(data))
                    except (json.JSONDecodeError, KeyError) as e:
                        print(
                            f"  WARN: skipping {member.name}: {e}", file=sys.stderr)
    return records


def aggregate(records):
    """Group records by (slot_time, gas_limit, voters) and compute stats."""
    groups = defaultdict(list)
    for r in records:
        key = (r['slot_time'], r['gas_limit'], r['voters'])
        groups[key].append(r)

    results = []
    for (slot, gas, voters), reps in sorted(groups.items()):
        total_votes = sum(r['successes'] + r['failures'] for r in reps)
        total_failures = sum(r['failures'] + r['presign_failures']
                             for r in reps)
        error_rate = total_failures / total_votes if total_votes > 0 else 0

        gas_m = round(gas / 1_000_000)
        # Theoretical TPS: votes_per_block / slot_time
        # votes_per_block is approximated from avg_votes_per_block
        avg_vpb = np.mean([r['avg_votes_per_block']
                          for r in reps]) if reps else 0
        theoretical_tps = avg_vpb / slot if slot else 0

        theoretical_vote_time = (total_votes * slot) / avg_vpb

        entry = {
            'slot_time': slot,
            'gas_limit': gas,
            'gas_limit_M': gas_m,
            'voters': voters,
            'iterations': len(reps),
            'error_rate': error_rate,
            'theoretical_tps': theoretical_tps,
            'theoretical_vote_time': theoretical_vote_time,
            'tps': compute_stats([r['tps'] for r in reps]),
            'avg_votes_per_block': compute_stats([r['avg_votes_per_block'] for r in reps]),
            'avg_gas_util': compute_stats([r['avg_gas_util'] for r in reps]),
            'vote_time_s': compute_stats([r['vote_time_s'] for r in reps]),
            'deploy_time_s': compute_stats([r['deploy_time_s'] for r in reps]),
        }
        results.append(entry)
    return results


def main():
    parser = argparse.ArgumentParser(
        description='Aggregate orchestrator benchmark results')
    parser.add_argument('paths', nargs='+',
                        help='Paths to tar.gz files or orchestrator output directories')
    parser.add_argument('--output-dir', '-o', default='aggregated_output',
                        help='Output directory for JSON and plots')
    args = parser.parse_args()

    all_records = []
    for path in args.paths:
        path = os.path.abspath(path)
        if path.endswith('.tar.gz') or path.endswith('.tgz'):
            print(f"Processing tarball: {path}")
            all_records.extend(collect_from_tarball(path))
        elif os.path.isdir(path):
            # Check if it's an orchestrator_* dir or contains them
            if LABEL_RE.match(os.path.basename(path).split('/')[0] if '/' in path else ''):
                print(f"Processing directory: {path}")
                all_records.extend(collect_from_directory(path))
            else:
                # Look for orchestrator_* subdirs or slot* subdirs
                found = False
                for entry in os.listdir(path):
                    subpath = os.path.join(path, entry)
                    if os.path.isdir(subpath):
                        if entry.startswith('orchestrator_') or LABEL_RE.match(entry):
                            print(f"Processing directory: {subpath}")
                            all_records.extend(collect_from_directory(subpath))
                            found = True
                if not found:
                    print(
                        f"  WARN: no orchestrator data found in {path}", file=sys.stderr)
        else:
            print(f"  WARN: skipping unknown path: {path}", file=sys.stderr)

    if not all_records:
        print("ERROR: No results found.", file=sys.stderr)
        sys.exit(1)

    print(f"\nCollected {len(all_records)} data points")
    aggregated = aggregate(all_records)
    print(
        f"Aggregated into {len(aggregated)} unique (slot, gas, voters) groups")

    os.makedirs(args.output_dir, exist_ok=True)
    output_json = os.path.join(args.output_dir, 'aggregated_results.json')
    with open(output_json, 'w') as f:
        json.dump(aggregated, f, indent=2)
    print(f"JSON written to {output_json}")


if __name__ == '__main__':
    main()
