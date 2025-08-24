import httpx
from abc import ABC, abstractmethod
from typing import Dict, List, Any

from fastapi import Request

class ScrapingInterface(ABC):
  """
  Definiendo el contrato para cualquier servicio de scraping.
  Cada scraper para un sitio específico debe implementar estos métodos.
  """
  def __init__(self, request: Request):
    self.request = request
    # Cada implementación tendrá su propio cliente http para mantener sesiones separadas
    self.session = httpx.AsyncClient(follow_redirects=True)
    
  @abstractmethod
  async def get_links(self, offset_range: int = 1) -> List[str]:
    """
    Debe obtener una lista de URLs de los elementos a scrapear para obtener más detalles.
    """ 
    pass
  
  @abstractmethod
  async def get_links_detail(self, detail_url: str) -> Dict[str, Any]:
    """
    Debe obtener el detalle de un elemento a partir de su URL.
    Debe retornar un diccionario con 'image_urls' y 'detail_text'.
    """
    pass