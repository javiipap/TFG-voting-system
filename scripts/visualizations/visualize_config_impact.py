#!/usr/bin/env python3
"""
Visualize the impact of chain parameters (gas limit, slot time) on throughput.

Reads results.json from multiple benchmark runs and produces:
1. TPS vs scale point with theoretical ceiling
2. Throughput efficiency
3. TPS vs gas limit
4. Gas utilization (bottleneck analysis)

Usage:
    python3 visualize_config_impact.py [run_dir1 run_dir2 ...]

If no arguments given, auto-discovers runs in benchmarks/ matching 'run_*gas*'.
"""
import json
import sys
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

plt.rcParams.update({
    'font.size': 11,
    'font.family': 'serif',
    'figure.dpi': 150,
    'axes.grid': True,
    'grid.alpha': 0.3,
})

OUTPUT_DIR = Path('benchmarks/config_impact_output')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_run(path):
    with open(Path(path) / 'results.json') as f:
        data = json.load(f)
    meta = data['metadata']
    gas_limit = meta['blockGasLimit']
    slot_time = meta['slotTimeS']
    per_vote_gas = data.get('gasModel', {}).get('perVoteTxGas', 1167830)
    theoretical_max_tps = gas_limit / (per_vote_gas * slot_time)

    scale_points = []
    for sp in data['scalePoints']:
        tps = sp['aggregated'].get('tps', {})
        gas_utils = []
        for r in sp['repetitions']:
            if r.get('throughput') and r['throughput'].get('avgGasUtil'):
                gas_utils.append(r['throughput']['avgGasUtil'])

        scale_points.append({
            'voters': sp['voters'],
            'tps_mean': tps.get('mean', 0),
            'tps_ci95': tps.get('ci95', 0),
            'gas_util_mean': np.mean(gas_utils) if gas_utils else 0,
        })

    label = f"{gas_limit/1e6:.0f}M gas / {slot_time}s slot"
    return {
        'label': label,
        'gas_limit': gas_limit,
        'slot_time': slot_time,
        'per_vote_gas': per_vote_gas,
        'theoretical_max_tps': theoretical_max_tps,
        'scale_points': scale_points,
    }


def discover_runs():
    base = Path('benchmarks')
    return sorted([d for d in base.iterdir() if d.is_dir() and 'gas' in d.name])


def main():
    if len(sys.argv) > 1:
        run_dirs = [Path(p) for p in sys.argv[1:]]
    else:
        run_dirs = discover_runs()

    if not run_dirs:
        print("No benchmark runs found. Pass paths as arguments or place them in benchmarks/.")
        return

    runs = [load_run(d) for d in run_dirs]
    # Sort by gas_limit then slot_time
    runs.sort(key=lambda r: (r['slot_time'], r['gas_limit']))

    voters_list = [sp['voters'] for sp in runs[0]['scale_points']]
    colors = plt.cm.tab10(np.linspace(0, 1, max(len(runs), 3)))
    markers = ['o', 's', '^', 'D', 'v', 'P', 'X', '*']

    # --- FIGURE 1: TPS vs Scale with Theoretical Ceiling ---
    fig, ax = plt.subplots(figsize=(8, 5))
    for i, run in enumerate(runs):
        x = [sp['voters'] for sp in run['scale_points']]
        y = [sp['tps_mean'] for sp in run['scale_points']]
        yerr = [sp['tps_ci95'] for sp in run['scale_points']]
        ax.errorbar(x, y, yerr=yerr, marker=markers[i % len(markers)], color=colors[i],
                    label=run['label'], capsize=4, linewidth=2)
        ax.axhline(run['theoretical_max_tps'], color=colors[i], linestyle='--', alpha=0.4, linewidth=1)

    ax.set_xlabel('Concurrent Voters')
    ax.set_ylabel('Throughput (TPS)')
    ax.set_title('Throughput vs Load (dashed = theoretical max)')
    ax.legend(fontsize=9)
    ax.set_xscale('log')
    ax.set_xticks(voters_list)
    ax.set_xticklabels(voters_list)
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / 'fig_tps_vs_theoretical.eps')
    fig.savefig(OUTPUT_DIR / 'fig_tps_vs_theoretical.png')
    plt.close()

    # --- FIGURE 2: Efficiency (actual/theoretical) ---
    fig, ax = plt.subplots(figsize=(8, 5))
    for i, run in enumerate(runs):
        x = [sp['voters'] for sp in run['scale_points']]
        eff = [sp['tps_mean'] / run['theoretical_max_tps'] * 100 for sp in run['scale_points']]
        ax.plot(x, eff, marker=markers[i % len(markers)], color=colors[i],
                label=run['label'], linewidth=2)

    ax.set_xlabel('Concurrent Voters')
    ax.set_ylabel('Throughput Efficiency (%)')
    ax.set_title('Actual / Theoretical Max Throughput')
    ax.axhline(100, color='gray', linestyle=':', alpha=0.5)
    ax.legend(fontsize=9)
    ax.set_xscale('log')
    ax.set_xticks(voters_list)
    ax.set_xticklabels(voters_list)
    ax.set_ylim(0, 110)
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / 'fig_efficiency.eps')
    fig.savefig(OUTPUT_DIR / 'fig_efficiency.png')
    plt.close()

    # --- FIGURE 3: TPS vs Gas Limit (one line per scale point) ---
    fig, ax = plt.subplots(figsize=(8, 5))
    for j, voters in enumerate(voters_list):
        gas_limits = [run['gas_limit'] / 1e6 for run in runs]
        tps_values = [run['scale_points'][j]['tps_mean'] for run in runs]
        ax.plot(gas_limits, tps_values, marker=markers[j % len(markers)],
                label=f'{voters} voters', linewidth=2)

    # Theoretical lines
    per_vote_gas = runs[0]['per_vote_gas']
    slot_times_seen = sorted(set(r['slot_time'] for r in runs))
    gas_range = np.linspace(10, max(r['gas_limit'] for r in runs) / 1e6 * 1.1, 100)
    for slot in slot_times_seen:
        theoretical = gas_range * 1e6 / (per_vote_gas * slot)
        ax.plot(gas_range, theoretical, '--', alpha=0.4, label=f'Max ({slot}s slot)')

    ax.set_xlabel('Block Gas Limit (M)')
    ax.set_ylabel('Throughput (TPS)')
    ax.set_title('TPS vs Gas Limit')
    ax.legend(fontsize=9)
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / 'fig_tps_vs_gas_limit.eps')
    fig.savefig(OUTPUT_DIR / 'fig_tps_vs_gas_limit.png')
    plt.close()

    # --- FIGURE 4: Gas utilization ---
    fig, ax = plt.subplots(figsize=(8, 5))
    for i, run in enumerate(runs):
        x = [sp['voters'] for sp in run['scale_points']]
        y = [sp['gas_util_mean'] * 100 for sp in run['scale_points']]
        ax.plot(x, y, marker=markers[i % len(markers)], color=colors[i],
                label=run['label'], linewidth=2)

    ax.set_xlabel('Concurrent Voters')
    ax.set_ylabel('Gas Utilization (%)')
    ax.set_title('Block Gas Utilization (higher = gas-limited)')
    ax.axhline(100, color='gray', linestyle=':', alpha=0.5)
    ax.legend(fontsize=9)
    ax.set_xscale('log')
    ax.set_xticks(voters_list)
    ax.set_xticklabels(voters_list)
    ax.set_ylim(0, 110)
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / 'fig_gas_utilization.eps')
    fig.savefig(OUTPUT_DIR / 'fig_gas_utilization.png')
    plt.close()

    # --- Summary ---
    print("\n=== Configuration Impact Summary ===\n")
    print(f"{'Config':<25} {'Gas (M)':<10} {'Slot (s)':<10} {'Max TPS':<10} {'Actual':<10} {'Eff.'}")
    print("-" * 75)
    for run in runs:
        # Use highest scale point for summary
        sp_max = run['scale_points'][-1]
        eff = sp_max['tps_mean'] / run['theoretical_max_tps'] * 100
        print(f"{run['label']:<25} {run['gas_limit']/1e6:<10.0f} {run['slot_time']:<10} "
              f"{run['theoretical_max_tps']:<10.1f} {sp_max['tps_mean']:<10.2f} {eff:.1f}%")

    print(f"\nPer-vote gas: ~{runs[0]['per_vote_gas']:,.0f}")
    print(f"Output: {OUTPUT_DIR}/")


if __name__ == '__main__':
    main()
