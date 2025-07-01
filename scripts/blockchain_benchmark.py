import subprocess
import sys
import time
import concurrent
import requests
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed


def deploy_contract(candidate_count=5, max_retries=3, retry_delay=1):
    """
    Realiza una petición POST con reintentos automáticos

    Args:
        max_retries (int, optional): Número máximo de reintentos. Defaults to 3.
        retry_delay (int, optional): Tiempo de espera entre reintentos en segundos. Defaults to 1.

    Returns:
        dict: Respuesta JSON parseada
    """
    URL = 'https://e3vote.iaas.ull.es/api/testing/elections'
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


def run_background(comando, archivo_salida):
    """
    Ejecuta un comando en segundo plano y redirige stdout/stderr a un archivo (modo append).
    DEVUELVE el objeto del proceso para poder gestionarlo después.

    Args:
        comando (list): Lista con el comando y sus argumentos
        archivo_salida (str): Ruta al archivo donde redirigir la salida

    Returns:
        subprocess.Popen: El objeto del proceso iniciado.
    """
    with open(archivo_salida, 'a+') as f:
        # Almacenamos el proceso en una variable 'p' y la devolvemos
        p = subprocess.Popen(
            comando,
            stdout=f,
            stderr=subprocess.DEVNULL,
            stdin=subprocess.DEVNULL,
            start_new_session=True
        )
        return p  # <--- CAMBIO 1: Devolver el proceso


def run_command(command_args, command_id):
    """
    Executes a single command and returns its stdout.
    """
    try:
        # Use subprocess.run for simplicity and to capture stdout
        result = subprocess.run(
            command_args,
            capture_output=True,  # Capture stdout and stderr
            text=True,            # Decode stdout/stderr as text
            check=True,           # Raise CalledProcessError for non-zero exit codes
            shell=False           # It's generally safer to set shell=False
                                  # and pass command as a list of arguments
        )
        print(f"Command {command_id} finished successfully.")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Command {command_id} failed with error: {e}")
        print(f"Stderr: {e.stderr}")
        return f"Error running command {command_id}: {e.stderr}"
    except FileNotFoundError:
        print(f"Error: Command '{command_args[0]}' not found.")
        return f"Error: Command '{command_args[0]}' not found."
    except Exception as e:
        print(f"An unexpected error occurred for command {command_id}: {e}")
        return f"Unexpected error for command {command_id}: {e}"


def run_commands_in_threadpool(command_to_run, num_executions, output_filename, max_workers=None):
    """
    Runs a specified command multiple times using a thread pool
    and saves all stdout to a single file.
    """
    if not isinstance(command_to_run, list):
        print(
            "Warning: 'command_to_run' should be a list of strings (e.g., ['ls', '-l']). Attempting to split.")
        command_args = command_to_run.split()
    else:
        command_args = command_to_run

    if not command_args:
        print("Error: No command specified to run.")
        return

    outputs = []
    # Use ThreadPoolExecutor to manage the threads
    # If max_workers is None, it defaults to the number of processors * 5
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit tasks to the executor
        # We use a dictionary to keep track of the future and its corresponding command_id
        future_to_command_id = {
            executor.submit(run_command, command_args, i + 1): i + 1
            for i in range(num_executions)
        }

        # As tasks complete, collect their results
        for future in as_completed(future_to_command_id):
            command_id = future_to_command_id[future]
            try:
                output = future.result()
                outputs.append(json.loads(output))
            except Exception as exc:
                print(
                    f"Command execution {command_id} generated an exception: {exc}")

    with open(output_filename, 'w+') as f:
        json.dump(outputs, f)

    return outputs


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
    if len(sys.argv) == 4:
        accounts_filename = sys.argv[3]

        with open(accounts_filename, 'r') as f:
            tickets = json.load(f)

    if not accounts_filename:
        contract_info = deploy_contract(candidate_count)

        public_key, private_key, contract_addr, election_id = contract_info

        print("Información del contrato desplegado:")
        print(f"  Contract addr: {contract_addr}")
        print(f"  Public key: {public_key}")
        print(f"  Private key: {private_key}")

        print(
            f"Ejecutando {num_executions} veces el comando con argumentos: {public_key} {contract_addr} {election_id}")

        out_dir = 'benchmarks'
        cmd_1 = ["npx", "tsx",
                 "scripts/generate-credentials.ts", str(election_id)]

        output_filename = 'accounts.json'

        tickets = run_commands_in_threadpool(
            cmd_1, num_executions, output_filename)

        if tickets is None:
            exit(1)

    cmd_2 = ["npx", "tsx", "scripts/blockchain-interactions.ts",
             public_key, contract_addr, str(candidate_count)]

    if not os.path.exists(out_dir):
        os.mkdir(out_dir)

    procesos = []  # Lista para guardar cada proceso
    for i, ticket in enumerate(tickets):
        print(f"Lanzando proceso {i + 1}/{num_executions}...")
        proceso = run_background(
            cmd_2 + [json.dumps(ticket)], f'{out_dir}/{i + 1}')
        procesos.append(proceso)

    print(
        f"\nTodos los {len(procesos)} comandos han sido lanzados. Esperando a que terminen...")

    # Bucle para esperar a que cada proceso finalice
    for i, p in enumerate(procesos):
        # Esta llamada es bloqueante: se detiene aquí hasta que el proceso 'p' termine.
        p.wait()
        print(f"Proceso {i + 1} ha finalizado.")

    print("\nTodos los procesos han finalizado. Script completado.")


if __name__ == '__main__':
    main()
