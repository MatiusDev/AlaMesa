import asyncio
from motor.motor_asyncio import AsyncIOMotorDatabase

def handle_official_restaurant(change: dict):
    """
    Esta es la función que se ejecutará cuando se detecte el cambio.
    Por ahora, solo imprime un mensaje y los datos del cambio.
    """
    print("\n✅ ¡Hello World! Se ha actualizado un restaurante a OFICIAL.")
    
    # El documento completo después del cambio está en 'fullDocument'
    official_restaurant = change.get('fullDocument')
    if official_restaurant:
        print(f"   Restaurante: {official_restaurant.get('name')}")
        print(f"   ID: {official_restaurant.get('_id')}")
        print(f"   Datos del campo 'oficial': {official_restaurant.get('oficial')}")
    print("-" * 30)

async def listen_for_official_restaurants(db: AsyncIOMotorDatabase):
    """
    Esta función se ejecuta en segundo plano para escuchar los cambios
    en la colección 'Restaurant'.
    """
    # Pipeline para filtrar los eventos que nos interesan:
    # 1. Solo operaciones de actualización (update).
    # 2. Donde el campo 'oficial' exista y no sea nulo en el documento actualizado.
    pipeline = [
        {
            '$match': {
                'operationType': 'update',
                'fullDocument.oficial': { '$exists': True, '$ne': None }
            }
        }
    ]

    print("🚀 Iniciando Change Stream para restaurantes oficiales...")
    try:
        # Usamos full_document='updateLookup' para obtener el documento completo en cada cambio
        async with db["Restaurant"].watch(pipeline, full_document='updateLookup') as stream:
            async for change in stream:
                handle_official_restaurant(change)
    except Exception as e:
        print(f"❌ Error en el Change Stream: {e}")
        # Aquí podrías añadir lógica para reiniciar el listener si falla
        await asyncio.sleep(5)
        # Usamos asyncio.create_task para reiniciar el listener en segundo plano
        asyncio.create_task(listen_for_official_restaurants(db))
