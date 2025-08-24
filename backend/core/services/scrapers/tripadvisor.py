import httpx
import asyncio
import json

from typing import Dict, List, Any

from bs4 import BeautifulSoup

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

  async def get_links(self, offset_range: int = 2) -> List[str]:
    restaurant_links = []
    offsets = [i * 30 for i in range(offset_range)]

    self.session.headers.update(HEADERS["USER_AGENT_HEADERS"])
    self.session.headers.update({'Referer': self.url_base})

    print("--- Iniciando Scraping de TripAdvisor (Lista) ---")
    for offset in offsets:
      current_url = f"{self.url_base}&offset={offset}"
      try:
        response = await self.session.get(current_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        main_container = soup.select_one(self.selectors["MAIN_CONTAINER"])
        if not main_container: continue

        for link_tag in main_container.select(self.selectors["REVIEW_LINK"]):
          url = link_tag.get('href')
          if url and url.startswith('/'):
            full_url = f"{self.host}{url}"
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
      self.session.headers.update(HEADERS["FULL_SESSION_HEADERS"])
      self.session.headers.update({'Referer': self.url_base})

      response = await self.session.get(detail_url)
      response.raise_for_status()
      soup = BeautifulSoup(response.content, 'html.parser')

      detail_container = soup.select_one(self.selectors["DETAIL_CONTAINER"])
      if not detail_container:
        raise Exception(f"Contenedor de detalle no encontrado en {detail_url}")

      image_urls = []
      image_presentation_div = detail_container.select_one(self.selectors["IMAGE_PRESENTATION_CONTAINER"])
      
      if image_presentation_div:
        source_tags = image_presentation_div.select(self.selectors["IMAGE_SOURCE"])
        for source in source_tags:
          if source.has_attr('srcset'):
            img_url = source['srcset'].split(' ')[0]
            if img_url.startswith('/'):
              img_url = f"{self.host}{img_url}"
            image_urls.append(img_url)
            
      link_urls = {}
      website_tag = detail_container.select_one(self.selectors["WEBSITE_BUTTON"])
      menu_tag = detail_container.select_one(self.selectors["MENU_BUTTON"])
      phone_tag = detail_container.select_one(self.selectors["PHONE_LINK"])
      email_tag = detail_container.select_one(self.selectors["EMAIL_LINK"])
      
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
      raise Exception(f"Error de scraping de detalle para {detail_url}: {str(e)}")
    finally:
      await asyncio.sleep(2)

  
