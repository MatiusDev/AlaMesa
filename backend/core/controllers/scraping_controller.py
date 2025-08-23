from fastapi import APIRouter, HTTPException

from core.services.scraping_service import SScrapingService
from core.services.agentai_service import SAgentAIService

route = APIRouter()

@route.get('/tripadvisor')
async def scrape_and_analyze(scrape_service: SScrapingService, ai_service: SAgentAIService):
  try:
    restaurant_links = await scrape_service.get_links()
  
    print("--- Scraping de Páginas de Lista Completado ---")
    print(f"Total de enlaces únicos de lista encontrados: {len(restaurant_links)}")

    if not restaurant_links:
      raise HTTPException(status_code=404, detail="No se encontraron enlaces de restaurantes para analizar.")

    # Tomar el primer enlace para el scraping de detalle y análisis con OpenAI
    first_restaurant_url = restaurant_links[0]
    print(f"Analizando el primer restaurante: {first_restaurant_url}")    
    details = await scrape_service.get_links_detail(first_restaurant_url)
    # Analizar el HTML del detalle con OpenAI
    structured_data = await ai_service.format_to_json(details['detail_text'])
        
    return {
      "message": "Análisis de restaurante completado.",
      "restaurant_data": structured_data,
      "image_urls": details['image_urls']
    }
  except HTTPException as e:
    raise e # Re-lanzar excepciones HTTP ya manejadas
  except Exception as e:
    print(e)  
    raise HTTPException(status_code=500, detail=f"Error general en el análisis del restaurante: {str(e)}")