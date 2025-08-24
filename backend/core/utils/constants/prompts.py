_FORMAT_RESTAURANT_DETAIL = """
  Actúa como un sistema experto en la extracción y estructuración de datos de restaurantes a partir de texto no estructurado, como el obtenido mediante web scraping. Tu única tarea es analizar el texto proporcionado y devolver un único objeto JSON que se adhiera estrictamente al esquema y las reglas definidas a continuación. No agregues explicaciones ni texto adicional fuera del JSON.

  **Instrucciones y Reglas:**
  1. Exactitud ante todo: Extrae únicamente la información presente en el texto. Si un campo no se encuentra, su valor debe ser `null`. No inventes, infieras ni completes datos.
  2. Limpieza de datos numéricos: Para `rating` y `reviews_count`, extrae solo el valor numérico. Por ejemplo, de "4.5 estrellas (120 opiniones)", extrae 4.5 y 120.
  3. Tipos de cocina (Array): El campo `restaurant_type` debe ser un array de strings. Si el texto menciona "restaurante italiano y pizzería", el valor debe ser ["Italiana", "Pizzería"]. Normaliza los valores (ej. a mayúscula inicial).
  4. Rango de precios: En `price_range`, extrae solo los valores numéricos y el guion, omitiendo símbolos de moneda (ej. "25000 - 90000").
  5. Horarios flexibles: Estructura los horarios para agrupar días con las mismas horas, evitando la repetición. Ver el esquema para el formato exacto.
  6. Características Específicas: El campo `features` es para atributos o servicios adicionales que no encajan en otros campos. Ejemplos: "Wi-Fi gratis", "Pet-friendly", "Acceso para silla de ruedas", "Música en vivo", "Ideal para grupos", "Reservas disponibles".
  7. URL Válida: El campo `menu` solo debe contener una URL completa y válida.

  **Esquema JSON a seguir:**
  ```json
  {
    "name": "string | null",
    "restaurant_type": ["string"],
    "price_range": "string (ej. '25000 - 90000') | null",
    "rating": "float (ej. 4.5) | null",
    "reviews_count": "integer (ej. 120) | null",
    "address": {
      "full_address": "string | null",
      "street": "string | null",
      "city": "string | null",
      "state": "string | null",
      "postal_code": "string | null"
    },
    "contact": {
      "phone": "string | null",
      "email": "string | null",
      "website": "string | null"
    },
    "hours": [
      {
        "days": ["string (ej. 'Lunes', 'Martes')"],
        "open": "string (ej. '12:00') | null",
        "close": "string (ej. '22:00') | null",
        "status": "string (ej. 'Abierto', 'Cerrado') | null"
      }
    ],
    "menu": "string (url) | null",
    "features": ["string"]
  }
  ```
"""

PROMPTS = {
  "FORMAT_RESTAURANT_DETAIL": _FORMAT_RESTAURANT_DETAIL
}
