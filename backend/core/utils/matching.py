# backend/core/utils/matching.py
from thefuzz import fuzz
from typing import Optional, Dict, Any

# Un umbral de similitud. Puedes ajustarlo según tus pruebas.
# 85 es un buen punto de partida.
SIMILARITY_THRESHOLD = 85

async def find_similar_restaurant(new_name: str, collection: Any) -> Optional[Dict[str, Any]]:
    """
    Busca en la colección de MongoDB un restaurante con un nombre similar.

    Args:
        new_name: El nombre del restaurante scrapeado.
        collection: El objeto de la colección de Motor (MongoDB).

    Returns:
        El documento del restaurante si se encuentra una coincidencia, o None.
    """
    # Obtenemos todos los restaurantes de la BD.
    # Nota: Para una base de datos muy grande, esto podría optimizarse.
    cursor = collection.find({}, {"name": 1}) # Solo traemos el nombre y el _id
    
    async for existing_restaurant in cursor:
        existing_name = existing_restaurant.get("name")
        if not existing_name:
            continue

        # Calculamos el ratio de similitud entre los nombres.
        ratio = fuzz.ratio(new_name.lower(), existing_name.lower())

        if ratio >= SIMILARITY_THRESHOLD:
            print(f"Coincidencia encontrada: '{new_name}' ~ '{existing_name}' (Ratio: {ratio}%)")
            # Si encontramos un match, necesitamos el documento completo para la actualización
            return await collection.find_one({"_id": existing_restaurant["_id"]})

    return None
