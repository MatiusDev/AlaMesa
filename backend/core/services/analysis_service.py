from fastapi import Depends, HTTPException
from typing import Annotated, Dict, Any

from .agentai_service import SAgentAIService
from .scrapers.interface import ScrapingInterface

class AnalysisService:
  """
  Orquestador para el análisis de scraping de restaurantes con AI.
  """
  def __init__(self, ai_service: SAgentAIService):
    self.ai_service = ai_service

  async def analyze_restaurant(self, scraper: ScrapingInterface) -> Dict[str, Any]:
    """
    Orquesta el proceso completo de scraping y análisis de un restaurante.
    """
    try:
      restaurant_links = await scraper.get_links()
    
      if not restaurant_links:
        raise HTTPException(status_code=404, detail="No se encontraron enlaces de restaurantes para analizar.")
      
      restaurant_url = restaurant_links[0]
      print(f"Analizando el primer restaurante: {restaurant_url}")
      
      details = await scraper.get_links_detail(restaurant_url)
      
      if not details:
        raise HTTPException(status_code=404, detail="No se encontraron detalles para el restaurante.")

      structured_data = await self.ai_service.format_to_json(details['detail_text'])
      
      if not structured_data:
        raise HTTPException(status_code=500, detail="El modelo no pudo procesar la información.")
      
      return {
        "restaurant_data": structured_data,
        "image_urls": details['image_urls']
      }
    except Exception as e:
      raise HTTPException(status_code=500, detail=f"Error durante el análisis del restaurante: {str(e)}")

SAnalysisService = Annotated[AnalysisService, Depends(AnalysisService)]