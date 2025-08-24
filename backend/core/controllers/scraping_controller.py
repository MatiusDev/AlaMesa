from fastapi import APIRouter, HTTPException, Path

# ¡LA MAGIA ESTÁ AQUÍ! Importamos la dependencia desde la nueva fábrica
from core.services.scrapers.factory import SScrapingService 
from core.services.analysis_service import SAnalysisService


route = APIRouter()

# El endpoint ahora es dinámico: /tripadvisor, /guiagourmet, etc.
@route.get('/{site}')
async def scrape_and_analyze(
    scraper: SScrapingService,
    analyzer: SAnalysisService,
    # El parámetro 'site' de la URL se pasa automáticamente a nuestra fábrica
    site: str = Path(..., title="El sitio a scrapear", description="Ej: tripadvisor"),
):
  try:
    analysis_result = await analyzer.analyze_restaurant(scraper)
    
    return {
      "message": "Análisis completado con éxito",
      "source_site": site,
      **analysis_result
    }
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))