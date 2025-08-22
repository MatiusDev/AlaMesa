from fastapi import APIRouter

from core.controllers.scraping_controller import route as scrapingRouter

routes = APIRouter()

routes.include_router(scrapingRouter, prefix="/scrape", tags=["Scraping"])