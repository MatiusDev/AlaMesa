import httpx
import asyncio

from fastapi import Depends, Request
from typing import Annotated
from bs4 import BeautifulSoup

from core.utils.constants.headers import USER_AGENT_HEADERS, FULL_SESSION_HEADERS

class ScrapingService:
  URL_BASE = "https://www.tripadvisor.co/FindRestaurants?geo=297478&establishmentTypes=10591%2C11776%2C16556%2C9900%2C9901%2C9909&broadened=false"
  
  def __init__(self, request: Request):
    self.request = request
    # Usamos httpx.AsyncClient para peticiones asíncronas
    self.session = httpx.AsyncClient(follow_redirects=True)
    
  async def get_links(self, offset_range: int = 2):
    restaurant_links = []
    offsets = [i * 30 for i in range(offset_range)]

    self.session.headers.update(USER_AGENT_HEADERS)
    self.session.headers.update({'Referer': self.URL_BASE})

    print("--- Iniciando Scraping de Páginas de Lista ---")
    for offset in offsets:
      current_url = f"{self.URL_BASE}&offset={offset}"
      print(f"Scraping página con offset={offset}...")

      try:
        response = await self.session.get(current_url)
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
              if full_url not in restaurant_links:
                restaurant_links.append(full_url)
        
        await asyncio.sleep(2) # Usamos asyncio.sleep en lugar de time.sleep
      
      except httpx.RequestError as e:
        print(f"Error de scraping en la página con offset={offset}: {str(e)}")
        continue
    
    # El return debe estar fuera del bucle para devolver todos los enlaces
    return restaurant_links
    
  async def get_links_detail(self, detail_url: str):
    print(f"Scraping página de detalle: {detail_url}")
    try:
      self.session.headers.update(FULL_SESSION_HEADERS)
      self.session.headers.update({'Referer': self.URL_BASE})

      response = await self.session.get(detail_url)
      response.raise_for_status()
      soup = BeautifulSoup(response.content, 'html.parser')

      detail_container = soup.find('div', attrs={'data-test-target': 'restaurants-detail'})
      if not detail_container:
        raise Exception(f"Contenedor de detalle no encontrado en {detail_url}")

      image_urls = []
      image_presentation_div = detail_container.find('div', attrs={'aria-label': 'Presentación de imágenes'})
      
      if image_presentation_div:
        source_tags = image_presentation_div.select('div > div > button > div > picture > source')
        for source in source_tags:
          if source.has_attr('srcset'):
            img_url = source['srcset'].split(' ')[0]
            if img_url.startswith('/'):
              img_url = f"https://www.tripadvisor.co{img_url}"
            image_urls.append(img_url)
      
      for script in detail_container("script"):
        script.extract()
        
      for style in detail_container("style"):
        style.extract()

      return {
        "image_urls": list(set(image_urls)),
        "detail_text": detail_container.get_text(separator=' ', strip=True)
      }
      
    except httpx.RequestError as e:
      # Es mejor lanzar una excepción específica que el controlador pueda manejar
      raise Exception(f"Error de scraping de detalle para {detail_url}: {str(e)}")
    finally:
      await asyncio.sleep(2)
  
SScrapingService = Annotated[ScrapingService, Depends(ScrapingService)]