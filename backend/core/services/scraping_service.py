import requests
import time

from fastapi import Depends, Request
from typing import Annotated
from bs4 import BeautifulSoup

from core.utils.constants.headers import USER_AGENT_HEADERS, FULL_SESSION_HEADERS

class ScrapingService:
  URL_BASE = "https://www.tripadvisor.co/FindRestaurants?geo=297478&establishmentTypes=10591%2C11776%2C16556%2C9900%2C9901%2C9909&broadened=false"
  
  def __init__(self, request: Request):
    self.request = request
    self.session = requests.Session()
    
  async def get_links(self, offset_range: int = 2):
    restaurant_links = []
    # Definimos los offsets para las primeras 2 páginas (0, 30, 60, 90)
    offsets = [i * 30 for i in range(offset_range)]

    # session = requests.Session()
    self.session.headers.update(USER_AGENT_HEADERS)
    self.session.headers.update({'Referer': self.URL_BASE})

    print("--- Iniciando Scraping de Páginas de Lista ---")
    for offset in offsets:
      current_url = f"{self.URL_BASE}&offset={offset}"
      print(f"Scraping página con offset={offset}...")

      try:
        # La sesión ya tiene las cabeceras de la lista
        response = self.session.get(current_url)
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

        for restaurant_div in restaurant_list:
          link_tag = restaurant_div.find('a')
          url = link_tag['href'] if link_tag and link_tag.has_attr('href') else None
          
          if url and "review" in url.lower():
            if url.startswith('/'):
              full_url = f"https://www.tripadvisor.co{url}"
              if full_url not in restaurant_links: # Evitar duplicados
                restaurant_links.append(full_url)
        time.sleep(2) # Pausa para ser respetuosos con el servidor
        return restaurant_links
      except requests.exceptions.RequestException as e:
        print(f"Error de scraping en la página con offset={offset}: {str(e)}")
        continue
    
  async def get_links_detail(self, detail_url: str):
    print(f"Scraping página de detalle: {detail_url}")
    try:
        # Actualizar las cabeceras de la sesión con las específicas para esta petición
        self.session.headers.update(FULL_SESSION_HEADERS)
        # El Referer para la página de detalle debe ser la página de lista de donde se obtuvo el enlace
        self.session.headers.update({'Referer': self.URL_BASE})

        response = self.session.get(detail_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser') # Usamos .content para que BeautifulSoup maneje la codificación

        detail_container = soup.find('div', attrs={'data-test-target': 'restaurants-detail'})
        if not detail_container:
          raise Exception(status_code=404, detail=f"Contenedor de detalle no encontrado en {detail_url}")

        image_urls = []
        # Buscar el div con aria-label="Presentación de imágenes"
        image_presentation_div = detail_container.find('div', attrs={'aria-label': 'Presentación de imágenes'})
        
        if image_presentation_div:
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
      raise Exception(status_code=500, detail=f"Error de scraping de detalle para {detail_url}: {str(e)}")
    finally:
        time.sleep(2) # Pausa para ser respetuosos con el servidor (aumentado a 2 segundos)
  
SScrapingService = Annotated[ScrapingService, Depends(ScrapingService)]