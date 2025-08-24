"""
Módulo de Configuración Central para Scrapers

Este archivo centraliza la configuración específica para cada sitio de scraping,
facilitando la adición de nuevos scrapers y el mantenimiento de los existentes.

Cada entrada en el diccionario SCRAPER_CONFIGS representa la configuración
para un sitio específico (por ejemplo, "tripadvisor").

Estructura de Configuración por Sitio:
  - HOST: El dominio principal del sitio.
  - URL_BASE: La URL base para las búsquedas o listados de restaurantes.
  - SELECTORS: Un diccionario que contiene los selectores de CSS/XPath
    utilizados para extraer datos específicos. Esto desacopla la lógica
    de scraping de los selectores, que cambian con frecuencia.
"""

SCRAPER_CONFIGS = {
    "tripadvisor": {
        "HOST": "https://www.tripadvisor.co",
        "URL_BASE": "https://www.tripadvisor.co/FindRestaurants?geo=297478&establishmentTypes=10591%2C11776%2C16556%2C9900%2C9901%2C9909&broadened=false",
        "SELECTORS": {
            "MAIN_CONTAINER": "div[data-automation='LeftRailMain']",
            "REVIEW_LINK": "a[href*='Restaurant_Review']",
            "DETAIL_CONTAINER": "div[data-test-target='restaurants-detail']",
            "IMAGE_PRESENTATION_CONTAINER": "div[aria-label='Presentación de imágenes']",
            "IMAGE_SOURCE": "div > div > button > div > picture > source",
            "WEBSITE_BUTTON": "a[data-automation='restaurantsWebsiteButton']",
            "MENU_BUTTON": "a[data-automation='restaurantsMenuButton']",
            "PHONE_LINK": "a[href^='tel:']",
            "EMAIL_LINK": "a[href^='mailto:']"
        }
    },
    # --- Ejemplo de cómo se añadiría un nuevo scraper en el futuro ---
    # "guiagourmet": {
    #     "HOST": "https://www.guiagourmet.com",
    #     "URL_BASE": "https://www.guiagourmet.com/restaurantes/medellin",
    #     "SELECTORS": {
    #         "main_container": "div.lista-restaurantes",
    #         "review_link": "a.nombre-restaurante",
    #         # ... etc ...
    #     }
    # }
}
