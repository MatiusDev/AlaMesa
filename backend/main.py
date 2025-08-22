import os
import uvicorn
import requests
import time
import openai
import json
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

app = FastAPI()

# URL base sin el offset
URL_BASE = "https://www.tripadvisor.co/FindRestaurants?geo=297478&establishmentTypes=10591%2C11776%2C16556%2C9900%2C9901%2C9909&broadened=false"

# Cabeceras para las páginas de lista (más simples, como las que funcionaban antes)
LIST_PAGE_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Referer': URL_BASE # Referer para la página de lista
}

# Cabeceras completas para las páginas de detalle (basadas en la información proporcionada)
DETAIL_PAGE_HEADERS = {
    'User-Agent': 'Mozilla/50 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'es,es-ES;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Cache-Control': 'max-age=0',
    'sec-ch-device-memory': '8',
    'sec-ch-ua': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
    'sec-ch-ua-arch': '"x86"',
    'sec-ch-ua-full-version-list': '"Not;A=Brand";v="99.0.0.0", "Microsoft Edge";v="139.0.3405.102", "Chromium";v="139.0.7258.128"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'priority': 'u=0, i'
}

# Inicializar el cliente de OpenAI de forma asíncrona
# Asegúrate de tener la variable de entorno OPENAI_API_KEY configurada
client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def analyze_text_with_openai(text_content: str):
    """
    Envía el texto plano a OpenAI para analizar y devolver un JSON estructurado.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo-0125", # Usar un modelo que soporte el modo JSON
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": """
                    Eres un asistente experto en analizar datos de scraping de restaurantes.
                    Analiza el texto plano proporcionado y extrae la información clave de cada restaurante.
                    Debes devolver un objeto JSON con una única clave "restaurante",
                    que contenga un objeto con la siguiente estructura:
                    {
                        "nombre": "Nombre del Restaurante",
                        "tipo_cocina": "Ej: Italiana, Fusión",
                        "rango_precios": "Ej: $$ - $$$",
                        "calificacion": "Ej: 4.5 de 5",
                        "numero_opiniones": "Ej: 123 opiniones",
                        "direccion": "Dirección completa del restaurante",
                        "telefono": "Número de teléfono"
                    }
                    Si no puedes encontrar un dato para un campo, déjalo como null.
                    Prioriza la información que esté claramente visible y estructurada en el texto.
                """},
                {"role": "user", "content": text_content}
            ]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar con OpenAI: {str(e)}")

async def scrape_restaurant_details(detail_url: str, session: requests.Session, headers: dict):
    """
    Realiza scraping de la página de detalle de un restaurante y extrae imágenes y HTML relevante.
    """
    print(f"Scraping página de detalle: {detail_url}")
    try:
        # Actualizar las cabeceras de la sesión con las específicas para esta petición
        session.headers.update(headers)
        # El Referer para la página de detalle debe ser la página de lista de donde se obtuvo el enlace
        session.headers.update({'Referer': URL_BASE}) 

        response = session.get(detail_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser') # Usamos .content para que BeautifulSoup maneje la codificación

        detail_container = soup.find('div', attrs={'data-test-target': 'restaurants-detail'})
        if not detail_container:
            raise HTTPException(status_code=404, detail=f"Contenedor de detalle no encontrado en {detail_url}")

        image_urls = []
        # Buscar el div con aria-label="Presentación de imágenes"
        image_presentation_div = detail_container.find('div', attrs={'aria-label': 'Presentación de imágenes'})
        
        if image_presentation_div:
            # Navegar a través de la estructura para encontrar las etiquetas <source>
            # div (padre) > div1, div2, div3 (divs donde estan la imagenes) > button > div > picture > source
            # Usamos select para una navegación más robusta
            source_tags = image_presentation_div.select('div > div > button > div > picture > source')
            for source in source_tags:
                if source.has_attr('srcset'):
                    # TripAdvisor a veces usa múltiples URLs en srcset, tomamos la primera
                    img_url = source['srcset'].split(' ')[0]
                    if img_url.startswith('/'): # Asegurarse de que la URL sea absoluta
                        img_url = f"https://www.tripadvisor.co{img_url}"
                    image_urls.append(img_url)
        
        # Extraer el texto plano del contenedor de detalle para que OpenAI lo analice
        # Excluimos scripts y estilos para reducir ruido antes de extraer el texto
        for script in detail_container("script"):
            script.extract()
        for style in detail_container("style"):
            style.extract()

        return {
            "image_urls": list(set(image_urls)), # Usar set para eliminar duplicados
            "detail_text": detail_container.get_text(separator=' ', strip=True) # Extraer texto plano
        }

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error de scraping de detalle para {detail_url}: {str(e)}")
    finally:
        time.sleep(2) # Pausa para ser respetuosos con el servidor (aumentado a 2 segundos)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/scrape")
async def scrape_and_analyze():
    """
    Realiza scraping en bucle a través de las páginas de resultados de TripAdvisor,
    luego scrapea la página de detalle del primer restaurante y la analiza con OpenAI.
    """
    all_restaurant_links = []
    # Definimos los offsets para las primeras 4 páginas (0, 30, 60, 90)
    offsets = [i * 30 for i in range(4)]

    # Inicializamos una sesión de requests para manejar cookies y cabeceras de forma persistente
    session = requests.Session()
    # Las cabeceras por defecto de la sesión serán las de la página de lista
    session.headers.update(LIST_PAGE_HEADERS)

    print("--- Iniciando Scraping de Páginas de Lista ---")
    for offset in offsets:
        current_url = f"{URL_BASE}&offset={offset}"
        print(f"Scraping página con offset={offset}...")

        try:
            # La sesión ya tiene las cabeceras de la lista
            response = session.get(current_url)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')
            
            main_container = soup.find('div', attrs={'data-automation': 'LeftRailMain'})

            if not main_container:
                print(f"  -> No se encontró el contenedor principal en la página con offset={offset}. Saltando...")
                continue

            restaurant_list = main_container.select(':scope > div > div > div')

            if not restaurant_list:
                print(f"  -> No se encontraron restaurantes en la página con offset={offset}. Saltando...")
                continue

            page_links_found = 0
            for restaurant_div in restaurant_list:
                link_tag = restaurant_div.find('a')
                url = link_tag['href'] if link_tag and link_tag.has_attr('href') else None
                
                if url and "review" in url.lower():
                    if url.startswith('/'):
                        full_url = f"https://www.tripadvisor.co{url}"
                        if full_url not in all_restaurant_links: # Evitar duplicados
                            all_restaurant_links.append(full_url)
                            page_links_found += 1
            
            print(f"  -> Se encontraron {page_links_found} nuevos enlaces.")

            time.sleep(2) # Pausa para ser respetuosos con el servidor

        except requests.exceptions.RequestException as e:
            print(f"Error de scraping en la página con offset={offset}: {str(e)}")
            continue

    print("--- Scraping de Páginas de Lista Completado ---")
    print(f"Total de enlaces únicos de lista encontrados: {len(all_restaurant_links)}")

    if not all_restaurant_links:
        raise HTTPException(status_code=404, detail="No se encontraron enlaces de restaurantes para analizar.")

    # Tomar el primer enlace para el scraping de detalle y análisis con OpenAI
    first_restaurant_url = all_restaurant_links[0]
    print(f"Analizando el primer restaurante: {first_restaurant_url}")

    try:
        # Scrapear la página de detalle, pasando las cabeceras específicas para detalle
        details = await scrape_restaurant_details(first_restaurant_url, session, DETAIL_PAGE_HEADERS)
        print(details['detail_text'])
        # Analizar el HTML del detalle con OpenAI
        structured_data = await analyze_text_with_openai(details['detail_text'])
        
        return {
            "message": "Análisis de restaurante completado.",
            "restaurant_data": structured_data,
            "image_urls": details['image_urls']
        }

    except HTTPException as e:
        raise e # Re-lanzar excepciones HTTP ya manejadas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error general en el análisis del restaurante: {str(e)}")

def run():
    ENVIRONTMENT = os.getenv("ENVIRONTMENT", "dev")
    SERVER_PORT = int(os.getenv("SERVER_PORT", 8000))
    
    
    if ENVIRONTMENT == "dev":
        SERVER_HOST = os.getenv("SERVER_HOST", "localhost")
        reload = True
        log_level = "debug"
    else:
        SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0")
        reload = False
        log_level = "info"


    uvicorn.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=reload, log_level=log_level)
    
if __name__ == "__main__":
    run()