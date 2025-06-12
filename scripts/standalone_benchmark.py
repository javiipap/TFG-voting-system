import subprocess
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
    URL = 'http://10.6.128.18:3000/api/testing/elections'
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


def run_background(comando, archivo_salida):
    """
    Ejecuta un comando en segundo plano y redirige stdout/stderr a un archivo (modo append)

    Args:
        comando (list): Lista con el comando y sus argumentos
        archivo_salida (str): Ruta al archivo donde redirigir la salida
    """
    with open(archivo_salida, 'a') as f:  # 'a' para append (no sobrescribir)
        subprocess.Popen(
            comando,
            stdout=f,
            stderr=subprocess.DEVNULL,  # Redirige stderr a stdout
            stdin=subprocess.DEVNULL,  # Redirige stdin a /dev/null
            start_new_session=True
        )


def main():
    if len(sys.argv) < 2:
        print("Uso: python script.py <num_ejecuciones>")
        sys.exit(1)

    try:
        num_executions = int(sys.argv[1])
    except ValueError:
        print("El número de ejecuciones debe ser un entero")
        sys.exit(1)

    contract_info = deploy_contract()

    public_key, private_key, contract_addr, election_id = contract_info

    print("Información del contrato desplegado:")
    print(f"  Contract addr: {contract_addr}")
    print(f"  Public key: {public_key}")
    print(f"  Private key: {private_key}")

    print(
        f"Ejecutando {num_executions} veces el comando con argumentos: {public_key} {contract_addr} {election_id}")

    out_file = 'benchmark.log'
    cmd = ["npx", "tsx", "scripts/user-flow.ts",
           public_key, contract_addr, str(election_id)]

    for _ in range(num_executions):
        run_background(cmd, out_file)


if __name__ == '__main__':
    main()
