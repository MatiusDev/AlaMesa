import httpx
import asyncio
import re
import json
import base64
import urllib.parse

from typing import Dict, List, Any

from bs4 import BeautifulSoup

from core.utils.constants.headers import USER_AGENT_HEADERS, FULL_SESSION_HEADERS
from .interface import ScrapingInterface

class TripAdvisorScraper(ScrapingInterface):
  HOST = "https://www.tripadvisor.co"
  URL_BASE = f"{HOST}/FindRestaurants?geo=297478&establishmentTypes=10591%2C11776%2C16556%2C9900%2C9901%2C9909&broadened=false"

  async def get_links(self, offset_range: int = 2) -> List[str]:
    restaurant_links = []
    offsets = [i * 30 for i in range(offset_range)]

    self.session.headers.update(USER_AGENT_HEADERS)
    self.session.headers.update({'Referer': self.URL_BASE})

    print("--- Iniciando Scraping de TripAdvisor (Lista) ---")
    for offset in offsets:
      current_url = f"{self.URL_BASE}&offset={offset}"
      try:
        response = await self.session.get(current_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        main_container = soup.find('div', attrs={'data-automation': 'LeftRailMain'})
        if not main_container: continue

        for link_tag in main_container.select('a[href*="Restaurant_Review"]'):
          url = link_tag.get('href')
          if url and url.startswith('/'):
            full_url = f"{self.HOST}{url}"
            if full_url not in restaurant_links:
              restaurant_links.append(full_url)
                
        await asyncio.sleep(2)
      except httpx.RequestError as e:
        print(f"Error de scraping en TripAdvisor (offset={offset}: {str(e)}")
        continue
    
    return restaurant_links
    
  async def get_links_detail(self, detail_url: str) -> Dict[str, Any]:
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
              img_url = f"{self.HOST}{img_url}"
            image_urls.append(img_url)
            
      link_urls = {}
      website_tag = detail_container.find('a', attrs={'data-automation': 'restaurantsWebsiteButton'})
      menu_tag = detail_container.find('a', attrs={'data-automation': 'restaurantsMenuButton'})
      phone_tag = detail_container.find('a[href^="tel:"]')
      email_tag = detail_container.find('a[href^="mailto:"]')
      
      link_urls['website'] = website_tag.get('href') if website_tag else None
      link_urls['menu'] = menu_tag.get('href') if menu_tag else None
      link_urls['phone'] = phone_tag.get('href') if phone_tag else None
      link_urls['email'] = email_tag.get('href') if email_tag else None
      
      for script_or_style in detail_container("script, style"):
        script_or_style.extract()

      detail_text = detail_container.get_text(separator=' ', strip=True)
      detail_text += json.dumps(link_urls)
      return {
        "image_urls": list(set(image_urls)),
        "detail_text": detail_text
      }
      
    except httpx.RequestError as e:
      # Es mejor lanzar una excepción específica que el controlador pueda manejar
      raise Exception(f"Error de scraping de detalle para {detail_url}: {str(e)}")
    finally:
      await asyncio.sleep(2)

  
