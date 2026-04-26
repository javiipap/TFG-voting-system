import subprocess
import sys
import time
import requests
import json
import os
import math


def deploy_contract(candidate_count=5, max_retries=3, retry_delay=1):
    """
    Realiza una petición POST con reintentos automáticos

    Args:
        max_retries (int, optional): Número máximo de reintentos. Defaults to 3.
        retry_delay (int, optional): Tiempo de espera entre reintentos en segundos. Defaults to 1.

    Returns:
        dict: Respuesta JSON parseada
    """
    URL = 'http://localhost:3000/api/testing/create-election'
    retries = 0

    while retries < max_retries:
        try:
            response = requests.post(URL, data=json.dumps({'candidateCount': candidate_count}), headers={
                                     'Content-Type': 'application/json'}, verify=False)

            if response.status_code == 200:
                try:
                    data = response.json()
                    return data['masterPublicKey'], data['elgamalPrivate'], data['contractAddr'], data['id']
                except json.JSONDecodeError:
                    raise ValueError("La respuesta no contiene JSON válido")

            retries += 1
            if retries < max_retries:
                print(
                    f"Intento {retries} fallido. Código: {response.status_code}. Reintentando en {retry_delay} segundos...")
                time.sleep(retry_delay)
            else:
                response.raise_for_status()

        except requests.exceptions.RequestException as e:
            retries += 1
            if retries < max_retries:
                print(
                    f"Error en la petición: {str(e)}. Reintentando en {retry_delay} segundos...")
                time.sleep(retry_delay)
            else:
                raise Exception(
                    f"Falló después de {max_retries} intentos. Error: {str(e)}")

    raise Exception("Unexpected end of function")


def split_into_batches(items, num_batches):
    """Split a list into num_batches roughly equal chunks."""
    k, m = divmod(len(items), num_batches)
    return [items[i * k + min(i, m):(i + 1) * k + min(i + 1, m)]
            for i in range(num_batches)]


def spawn_worker(comando, archivo_salida):
    """
    Ejecuta un comando en segundo plano y redirige stdout/stderr a un archivo.
    DEVUELVE el objeto del proceso para poder gestionarlo después.

    Args:
        comando (list): Lista con el comando y sus argumentos
        archivo_salida (str): Ruta al archivo donde redirigir la salida

    Returns:
        subprocess.Popen: El objeto del proceso iniciado.
    """
    # Abrimos los ficheros sin 'with' para que no se cierren al salir de la función.
    # El fd lo hereda el proceso hijo; los cerramos tras p.wait() en el bucle principal.
    f_out = open(archivo_salida, 'w')
    f_err = open(archivo_salida + '.err', 'w')
    # Almacenamos el proceso en una variable 'p' y la devolvemos
    p = subprocess.Popen(
        comando,
        stdout=f_out,
        stderr=f_err,
        stdin=subprocess.DEVNULL,
        start_new_session=True
    )
    p._bench_files = (f_out, f_err)  # guardamos referencia para cerrar después
    return p


def wait_and_close(procesos):
    """Espera a que todos los procesos finalicen y cierra sus ficheros."""
    for i, p in enumerate(procesos):
        # Esta llamada es bloqueante: se detiene aquí hasta que el proceso 'p' termine.
        p.wait()
        # Cerramos los ficheros de salida del proceso
        for f in p._bench_files:
            f.close()
        print(f"  Worker {i + 1}/{len(procesos)} ha finalizado (exit={p.returncode}).")


def collect_json_results(out_dir, num_workers, prefix='voting_worker'):
    """Read and merge JSON array results from worker output files."""
    results = []
    for i in range(1, num_workers + 1):
        path = f'{out_dir}/{prefix}_{i}'
        try:
            with open(path, 'r') as f:
                content = f.read().strip()
                if content:
                    parsed = json.loads(content)
                    # Each worker outputs a JSON array; merge them
                    if isinstance(parsed, list):
                        results.extend(parsed)
                    else:
                        results.append(parsed)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            # Check stderr for diagnostics
            err_path = path + '.err'
            err_msg = ''
            try:
                with open(err_path, 'r') as ef:
                    err_msg = ef.read().strip()[-500:]
            except FileNotFoundError:
                pass
            print(f"Warning: could not read result from {path}: {e}")
            if err_msg:
                print(f"  stderr tail: {err_msg}")
    return results


def compute_stats(values):
    """Compute avg/min/max for a list of numeric values."""
    if not values:
        return None
    return {
        'avg': sum(values) / len(values),
        'min': min(values),
        'max': max(values),
        'count': len(values),
    }


def compute_timing_summary(credential_results, voting_results):
    """Compute avg/min/max for each timing field across all results."""
    summary = {'credentialGeneration': {}, 'voting': {}}

    # Credential timing from generate-credentials.ts output
    cred_timings = [r['timing'] for r in credential_results if 'timing' in r]
    if cred_timings:
        for k in cred_timings[0].keys():
            vals = [t[k] for t in cred_timings if k in t]
            if vals:
                summary['credentialGeneration'][k] = compute_stats(vals)

    # Top-level voting timing (grantTime, castingTime)
    for k in ['grantTime', 'castingTime']:
        vals = [r[k] for r in voting_results if k in r]
        if vals:
            summary['voting'][k] = compute_stats(vals)

    # Nested voting timing from blockchain-interactions.ts output
    vote_timings = [r.get('timing', {}) for r in voting_results]
    all_keys = set()
    for t in vote_timings:
        all_keys.update(t.keys())
    for k in all_keys:
        vals = [t[k] for t in vote_timings if k in t]
        if vals:
            summary['voting'][k] = compute_stats(vals)

    return summary


def main():
    if len(sys.argv) < 3:
        print(
            "Uso: python script.py <num_ejecuciones> <candidate_count> <opt:accounts_filename>")
        sys.exit(1)

    try:
        num_executions = int(sys.argv[1])
        candidate_count = int(sys.argv[2])
    except ValueError:
        print("El número de ejecuciones debe ser un entero")
        sys.exit(1)

    tickets = []
    accounts_filename = None
    out_dir = 'benchmarks'
    benchmark_timing = {}
    num_workers = os.cpu_count() or 4

    if len(sys.argv) == 4:
        accounts_filename = sys.argv[3]

        with open(accounts_filename, 'r') as f:
            tickets = json.load(f)

    if not os.path.exists(out_dir):
        os.mkdir(out_dir)

    if not accounts_filename:
        # --- Phase 1: Deploy contract ---
        print("=== Phase 1: Deploy contract ===")
        t0 = time.time()
        contract_info = deploy_contract(candidate_count)
        deploy_time = time.time() - t0

        public_key, private_key, contract_addr, election_id = contract_info
        benchmark_timing['deployTimeS'] = deploy_time

        print("Información del contrato desplegado:")
        print(f"  Deploy time: {deploy_time:.2f}s")
        print(f"  Contract addr: {contract_addr}")
        print(f"  Public key: {public_key}")
        print(f"  Private key: {private_key}")

        # --- Phase 2: Generate credentials ---
        # Spawn cpu_count workers, each generating N/cpus credentials concurrently
        print(f"\n=== Phase 2: Generate {num_executions} credentials ({num_workers} workers) ===")
        t0 = time.time()

        # Split batch sizes across workers
        batch_sizes = []
        base = num_executions // num_workers
        remainder = num_executions % num_workers
        for i in range(num_workers):
            batch_sizes.append(base + (1 if i < remainder else 0))
        # Filter out zero-size batches
        batch_sizes = [b for b in batch_sizes if b > 0]
        actual_cred_workers = len(batch_sizes)

        cmd_base = ["npx", "tsx", "scripts/generate-credentials.ts", str(election_id)]

        procesos = []
        for i, bs in enumerate(batch_sizes):
            out_file = f'{out_dir}/cred_worker_{i + 1}'
            print(f"  Lanzando worker {i + 1}/{actual_cred_workers} (batch={bs})...")
            p = spawn_worker(cmd_base + [str(bs)], out_file)
            procesos.append(p)

        wait_and_close(procesos)

        # Collect all credential results
        tickets = collect_json_results(out_dir, actual_cred_workers, prefix='cred_worker')

        credential_time = time.time() - t0
        benchmark_timing['credentialGenTimeS'] = credential_time
        print(f"  Credential generation: {credential_time:.2f}s ({num_executions} credentials, {credential_time/max(len(tickets),1):.2f}s avg)")

        if not tickets:
            print("Error: No credentials were generated.")
            exit(1)

        # Save credentials for potential re-use
        output_filename = 'accounts.json'
        with open(output_filename, 'w') as f:
            json.dump(tickets, f)

    # --- Phase 3: Voting ---
    # Spawn cpu_count workers, each processing N/cpus tickets concurrently
    actual_vote_workers = min(num_workers, len(tickets))
    print(f"\n=== Phase 3: Submit {len(tickets)} votes ({actual_vote_workers} workers) ===")
    t0 = time.time()

    # Split tickets into batches and write each to a temp file
    batches = split_into_batches(tickets, actual_vote_workers)

    cmd_base = ["npx", "tsx", "scripts/blockchain-interactions.ts",
                public_key, contract_addr, str(candidate_count)]

    procesos = []  # Lista para guardar cada proceso
    for i, batch in enumerate(batches):
        # Write batch to a temp file for the worker to read
        batch_file = f'{out_dir}/batch_{i + 1}.json'
        with open(batch_file, 'w') as f:
            json.dump(batch, f)

        out_file = f'{out_dir}/voting_worker_{i + 1}'
        print(f"  Lanzando worker {i + 1}/{actual_vote_workers} (tickets={len(batch)})...")
        p = spawn_worker(cmd_base + [batch_file], out_file)
        procesos.append(p)

    print(
        f"\n  Todos los {len(procesos)} workers han sido lanzados. Esperando a que terminen...")

    # Bucle para esperar a que cada proceso finalice
    wait_and_close(procesos)

    voting_time = time.time() - t0
    benchmark_timing['votingTimeS'] = voting_time
    print(f"  Voting phase: {voting_time:.2f}s ({voting_time/max(len(tickets),1):.3f}s avg)")

    # --- Summary: collect results and compute statistics ---
    print(f"\n=== Timing Summary ===")

    voting_results = collect_json_results(out_dir, actual_vote_workers, prefix='voting_worker')
    timing_summary = compute_timing_summary(tickets, voting_results)

    benchmark_output = {
        'config': {
            'numExecutions': num_executions,
            'candidateCount': candidate_count,
            'numWorkers': num_workers,
        },
        'phaseTiming': benchmark_timing,
        'detailedTiming': timing_summary,
    }

    summary_path = f'{out_dir}/summary.json'
    with open(summary_path, 'w') as f:
        json.dump(benchmark_output, f, indent=2)

    # Print human-readable summary
    for phase, label in [('deployTimeS', 'Deploy'), ('credentialGenTimeS', 'Credential Gen'), ('votingTimeS', 'Voting')]:
        if phase in benchmark_timing:
            print(f"  {label}: {benchmark_timing[phase]:.2f}s")

    total = sum(benchmark_timing.values())
    print(f"  Total: {total:.2f}s")

    if timing_summary.get('credentialGeneration'):
        print(f"\n  Credential breakdown (avg ms):")
        for k, v in timing_summary['credentialGeneration'].items():
            print(f"    {k}: {v['avg']:.1f}ms")

    if timing_summary.get('voting'):
        print(f"\n  Voting breakdown (avg ms):")
        for k, v in timing_summary['voting'].items():
            print(f"    {k}: {v['avg']:.1f}ms")

    print(f"\n  Successful votes: {len(voting_results)}/{num_executions}")
    print(f"\nDetailed results saved to {summary_path}")
    print("\nTodos los procesos han finalizado. Script completado.")


if __name__ == '__main__':
    main()
