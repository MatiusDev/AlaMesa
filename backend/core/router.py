from fastapi import APIRouter

from core.controllers.scraping_controller import route as scrapingRouter
from core.controllers.restaurant_controller import router as restaurantRouter
# from core.controllers.owner_controller import router as ownerRouter
# from core.controllers.diner_controller import router as dinerRouter
from core.controllers.review_controller import router as reviewRouter
from core.controllers.reservation_controller import router as reservationRouter

routes = APIRouter()

# General routes
routes.include_router(scrapingRouter, prefix="/scrape", tags=["Scraping"])

# Entity routes
routes.include_router(restaurantRouter, prefix="/restaurants", tags=["Restaurants"])
# routes.include_router(ownerRouter, prefix="/owners", tags=["Owners"])
# routes.include_router(dinerRouter, prefix="/diners", tags=["Diners"])
routes.include_router(reviewRouter, prefix="/reviews", tags=["Reviews"])
routes.include_router(reservationRouter, prefix="/reservations", tags=["Reservations"])
