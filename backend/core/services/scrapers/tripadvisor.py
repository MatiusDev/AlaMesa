import httpx
import asyncio
<<<<<<< HEAD
import json
=======
import re
import json
import base64
import urllib.parse
>>>>>>> 0d7cae4 (NEW: Adding factory pattern on scraping services behavior)

from typing import Dict, List, Any

from bs4 import BeautifulSoup

<<<<<<< HEAD
from .interface import ScrapingInterface

from core.utils.constants.headers import HEADERS
from core.utils.constants.scrapers_config import SCRAPER_CONFIGS

class TripAdvisorScraper(ScrapingInterface):
  def __init__(self, request):
    super().__init__(request)
    self.config = SCRAPER_CONFIGS["tripadvisor"]
    self.host = self.config["HOST"]
    self.url_base = self.config["URL_BASE"]
    self.selectors = self.config["SELECTORS"]
=======
from core.utils.constants.headers import USER_AGENT_HEADERS, FULL_SESSION_HEADERS
from .interface import ScrapingInterface

class TripAdvisorScraper(ScrapingInterface):
  HOST = "https://www.tripadvisor.co"
  URL_BASE = f"{HOST}/FindRestaurants?geo=297478&establishmentTypes=10591%2C11776%2C16556%2C9900%2C9901%2C9909&broadened=false"
>>>>>>> 0d7cae4 (NEW: Adding factory pattern on scraping services behavior)

  async def get_links(self, offset_range: int = 2) -> List[str]:
    restaurant_links = []
    offsets = [i * 30 for i in range(offset_range)]

<<<<<<< HEAD
    self.session.headers.update(HEADERS["USER_AGENT_HEADERS"])
    self.session.headers.update({'Referer': self.url_base})

    print("--- Iniciando Scraping de TripAdvisor (Lista) ---")
    for offset in offsets:
      current_url = f"{self.url_base}&offset={offset}"
=======
    self.session.headers.update(USER_AGENT_HEADERS)
    self.session.headers.update({'Referer': self.URL_BASE})

    print("--- Iniciando Scraping de TripAdvisor (Lista) ---")
    for offset in offsets:
      current_url = f"{self.URL_BASE}&offset={offset}"
>>>>>>> 0d7cae4 (NEW: Adding factory pattern on scraping services behavior)
      try:
        response = await self.session.get(current_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
<<<<<<< HEAD
        main_container = soup.select_one(self.selectors["MAIN_CONTAINER"])
        if not main_container: continue

        for link_tag in main_container.select(self.selectors["REVIEW_LINK"]):
          url = link_tag.get('href')
          if url and url.startswith('/'):
            full_url = f"{self.host}{url}"
=======
        main_container = soup.find('div', attrs={'data-automation': 'LeftRailMain'})
        if not main_container: continue

        for link_tag in main_container.select('a[href*="Restaurant_Review"]'):
          url = link_tag.get('href')
          if url and url.startswith('/'):
            full_url = f"{self.HOST}{url}"
>>>>>>> 0d7cae4 (NEW: Adding factory pattern on scraping services behavior)
            if full_url not in restaurant_links:
              restaurant_links.append(full_url)
                
        await asyncio.sleep(1)
      except httpx.RequestError as e:
        print(f"Error de scraping en TripAdvisor (offset={offset}: {str(e)}")
        continue
    
    return restaurant_links
    
  async def get_links_detail(self, detail_url: str) -> Dict[str, Any]:
    print(f"Scraping página de detalle: {detail_url}")
    try:
<<<<<<< HEAD
      self.session.headers.update(HEADERS["FULL_SESSION_HEADERS"])
      self.session.headers.update({'Referer': self.url_base})
=======
      self.session.headers.update(FULL_SESSION_HEADERS)
      self.session.headers.update({'Referer': self.URL_BASE})
>>>>>>> 0d7cae4 (NEW: Adding factory pattern on scraping services behavior)

      response = await self.session.get(detail_url)
      response.raise_for_status()
      soup = BeautifulSoup(response.content, 'html.parser')

<<<<<<< HEAD
      detail_container = soup.select_one(self.selectors["DETAIL_CONTAINER"])
=======
      detail_container = soup.find('div', attrs={'data-test-target': 'restaurants-detail'})
>>>>>>> 0d7cae4 (NEW: Adding factory pattern on scraping services behavior)
      if not detail_container:
        raise Exception(f"Contenedor de detalle no encontrado en {detail_url}")

      image_urls = []
<<<<<<< HEAD
      image_presentation_div = detail_container.select_one(self.selectors["IMAGE_PRESENTATION_CONTAINER"])
      
      if image_presentation_div:
        source_tags = image_presentation_div.select(self.selectors["IMAGE_SOURCE"])
=======
      image_presentation_div = detail_container.find('div', attrs={'aria-label': 'Presentación de imágenes'})
      
      if image_presentation_div:
        source_tags = image_presentation_div.select('div > div > button > div > picture > source')
>>>>>>> 0d7cae4 (NEW: Adding factory pattern on scraping services behavior)
        for source in source_tags:
          if source.has_attr('srcset'):
            img_url = source['srcset'].split(' ')[0]
            if img_url.startswith('/'):
<<<<<<< HEAD
              img_url = f"{self.host}{img_url}"
            image_urls.append(img_url)
            
      link_urls = {}
      website_tag = detail_container.select_one(self.selectors["WEBSITE_BUTTON"])
      menu_tag = detail_container.select_one(self.selectors["MENU_BUTTON"])
      phone_tag = detail_container.select_one(self.selectors["PHONE_LINK"])
      email_tag = detail_container.select_one(self.selectors["EMAIL_LINK"])
=======
              img_url = f"{self.HOST}{img_url}"
            image_urls.append(img_url)
            
      link_urls = {}
      website_tag = detail_container.find('a', attrs={'data-automation': 'restaurantsWebsiteButton'})
      menu_tag = detail_container.find('a', attrs={'data-automation': 'restaurantsMenuButton'})
      phone_tag = detail_container.find('a[href^="tel:"]')
      email_tag = detail_container.find('a[href^="mailto:"]')
>>>>>>> 0d7cae4 (NEW: Adding factory pattern on scraping services behavior)
      
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
<<<<<<< HEAD
=======
      # Es mejor lanzar una excepción específica que el controlador pueda manejar
>>>>>>> 0d7cae4 (NEW: Adding factory pattern on scraping services behavior)
      raise Exception(f"Error de scraping de detalle para {detail_url}: {str(e)}")
    finally:
      await asyncio.sleep(1)

  
