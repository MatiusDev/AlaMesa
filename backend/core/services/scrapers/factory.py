from typing import Annotated

from fastapi import Depends, Request, HTTPException

from .interface import ScrapingInterface
from .tripadvisor import TripAdvisorScraper

def get_scraper_service(site: str, request: Request) -> ScrapingInterface:
  """
  Fabrica de dependencias.
  Permite crear una instancia del scraper correcto para el sitio especificado.
  FastAPI llamará al scraper que cumpla con 'site' y implemente 'ScrapingInterface'.
  """
  if site == "tripadvisor":
    return TripAdvisorScraper(request)
  
  raise HTTPException(status_code=404, detail=f"Sitio de scraping '{site}' no soportado.")

# Creamos un tipo anotado para inyectar en los controladores, le dice a FastAPI que debe usar get_scraper_service como su proveedor del servicio
SScrapingService = Annotated[ScrapingInterface, Depends(get_scraper_service)]