from typing import Annotated, Dict,Type

from fastapi import Depends, Request, HTTPException

from .interface import ScrapingInterface
from .tripadvisor import TripAdvisorScraper
from core.utils.constants.scrapers_config import SCRAPER_CONFIGS

# Mapeo de sitios a clases de scraper para hacerlo escalable
# Para añadir un nuevo scraper, solo necesitas añadirlo a este diccionario
# y a SCRAPER_CONFIGS.
SCRAPER_MAPPING: Dict[str, Type[ScrapingInterface]] = {
    "tripadvisor": TripAdvisorScraper,
    # "guiagourmet": GuiaGourmetScraper, # -> Ejemplo futuro
}

def get_scraper_service(site: str, request: Request) -> ScrapingInterface:
  """
  Fabrica de dependencias dinámica.

  Permite crear una instancia del scraper correcto para el sitio especificado.
  Utiliza el diccionario SCRAPER_CONFIGS para verificar si un sitio es compatible
  y el SCRAPER_MAPPING para instanciar la clase correcta.
  """
  if site not in SCRAPER_CONFIGS:
    raise HTTPException(status_code=404, detail=f"Sitio de scraping '{site}' no soportado.")
  
  if site not in SCRAPER_MAPPING:
    raise HTTPException(status_code=501, detail=f"Sitio de scraping '{site}' no implementado.")
  
  scraper_class = SCRAPER_MAPPING[site]
  return scraper_class(request)

# Creamos un tipo anotado para inyectar en los controladores, le dice a FastAPI que debe usar get_scraper_service como su proveedor del servicio
SScrapingService = Annotated[ScrapingInterface, Depends(get_scraper_service)]