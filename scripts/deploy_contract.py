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
