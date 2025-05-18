import subprocess
from concurrent.futures import ThreadPoolExecutor
import statistics
import sys
import time
import requests
import json


def deploy_contract(max_retries=3, retry_delay=1):
    """
    Realiza una petición POST con reintentos automáticos

    Args:
        max_retries (int, optional): Número máximo de reintentos. Defaults to 3.
        retry_delay (int, optional): Tiempo de espera entre reintentos en segundos. Defaults to 1.

    Returns:
        dict: Respuesta JSON parseada
    """
    URL = 'http://localhost:3000/api/testing/elections'
    retries = 0

    while retries < max_retries:
        try:
            response = requests.post(URL)

            # Verificar si la respuesta es exitosa (código 200)
            if response.status_code == 200:
                try:
                    data = response.json()
                    return data['masterPublicKey'], data['elgamalPrivate'], data['contractAddr'], data['id']
                except json.JSONDecodeError:
                    raise ValueError("La respuesta no contiene JSON válido")

            # Si no es 200, incrementar contador de reintentos
            retries += 1
            if retries < max_retries:
                print(
                    f"Intento {retries} fallido. Código: {response.status_code}. Reintentando en {retry_delay} segundos...")
                time.sleep(retry_delay)
            else:
                response.raise_for_status()  # Lanzará una excepción para códigos 4XX/5XX

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


def run_command(args):
    """Ejecuta el comando y devuelve los dos números como tupla de floats"""
    command = ["npx", "tsx", "scripts/user-flow.ts"] + args
    try:
        start_time = time.time()
        result = subprocess.run(command, check=True,
                                capture_output=True, text=True)
        output = result.stdout.strip()
        num1, num2, num3 = map(float, output.split(','))
        execution_time = time.time() - start_time
        print(
            f"Comando ejecutado exitosamente en {execution_time:.2f}s: {' '.join(command)}")
        return num1, num2, num3
    except subprocess.CalledProcessError as e:
        print(f"Error al ejecutar el comando {' '.join(command)}: {e.stderr}")
        return None
    except ValueError:
        print(f"El comando no devolvió dos números válidos: {output}")
        return None


def main():
    if len(sys.argv) < 2:
        print("Uso: python script.py <num_ejecuciones>")
        sys.exit(1)

    try:
        num_executions = int(sys.argv[1])
    except ValueError:
        print("El número de ejecuciones debe ser un entero")
        sys.exit(1)

    numbers1 = []
    numbers2 = []

    contract_info = deploy_contract()

    public_key, private_key, contract_addr, election_id = contract_info
    args = [public_key, contract_addr, str(election_id)]

    print("Información del contrato desplegado:")
    print(f"  Contract addr: {contract_addr}")
    print(f"  Public key: {public_key}")
    print(f"  Private key: {private_key}")

    print(
        f"Ejecutando {num_executions} veces el comando con argumentos: {public_key} {contract_addr} {election_id}")

    with ThreadPoolExecutor(8) as executor:
        # Usamos list() para esperar a que todos los comandos terminen
        results = list(executor.map(
            lambda _: run_command(args), range(num_executions)))

    # Filtrar resultados None (fallidos)
    successful_results = [res for res in results if res is not None]

    if not successful_results:
        print("No se completó ninguna ejecución exitosamente")
        return

    numbers1, numbers2, numbers3 = zip(*successful_results)
    num_success = len(successful_results)

    # Cálculos estadísticos
    mean1 = statistics.mean(numbers1)
    mean2 = statistics.mean(numbers2)
    mean3 = statistics.mean(numbers3)

    try:
        stdev1 = statistics.stdev(numbers1) if num_success > 1 else 0
        stdev2 = statistics.stdev(numbers2) if num_success > 1 else 0
        stdev3 = statistics.stdev(numbers3) if num_success > 1 else 0
    except statistics.StatisticsError:
        stdev1 = 0
        stdev2 = 0
        stdev3 = 0

    # Resultados
    print("\nResultados estadísticos:")
    print(f"Ejecuciones exitosas: {num_success}/{num_executions}")
    print(f"Mean 1: {mean1:.2f} ± {stdev1:.2f} (std. dev)")
    print(f"Mean 2: {mean2:.2f} ± {stdev2:.2f} (std. dev)")
    print(f"Mean 3: {mean3:.2f} ± {stdev3:.2f} (std. dev)")


if __name__ == "__main__":
    main()
