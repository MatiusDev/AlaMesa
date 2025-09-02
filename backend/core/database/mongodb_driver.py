import os
import motor.motor_asyncio
from typing import Annotated
from fastapi import Depends

class MongoDriver:
    """
    Clase para gestionar la conexión del driver de MongoDB.

    Asegura que solo exista una instancia del cliente de Motor durante el ciclo
    de vida de la aplicación, como se recomienda en la documentación oficial.
    """
    _client = None

    def __init__(self):
        """
        Inicializa la conexión con la base de datos.
        Lee la URI de conexión de las variables de entorno.
        """
        if MongoDriver._client is None:
            MONGO_URI = os.getenv("MONGODB_URI")
            if not MONGO_URI:
                raise ValueError("No se encontró la variable de entorno MONGODB_URI. Asegúrate de que esté definida en tu archivo .env")
            
            print("Inicializando cliente de MongoDB...")
            MongoDriver._client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
            print("Cliente de MongoDB inicializado.")

    def get_database(self, db_name: str = "alamesa_db"):
        """
        Obtiene una referencia a una base de datos específica.

        Args:
            db_name (str): El nombre de la base de datos a la que conectar. 
                           Por defecto es 'alamesa_db'.

        Returns:
            La base de datos de Motor.
        """
        if self._client:
            return self._client[db_name]
        else:
            raise ConnectionError("El cliente de MongoDB no ha sido inicializado.")

    async def close(self):
        """Cierra la conexión con MongoDB"""
        if self._client:
            self._client.close()
            print("Conexión a MongoDB cerrada.")

# Instancia única del driver para ser importada en otras partes de la aplicación
db_driver = MongoDriver()

# Dependencia para obtener la base de datos de MongoDB
async def get_mongodb_db():
    """Dependencia de FastAPI para obtener la base de datos de MongoDB"""
    db = db_driver.get_database()
    try:
        yield db
    finally:
        # No cerramos la conexión aquí ya que es una instancia singleton
        pass

# Función para inicializar MongoDB (verificar conexión)
async def init_mongodb():
    """Verifica la conexión a MongoDB"""
    try:
        db = db_driver.get_database()
        # Hacer una operación simple para verificar la conexión
        await db.command("ping")
        print("Conexión a MongoDB verificada correctamente")
    except Exception as e:
        print(f"Error al conectar con MongoDB: {e}")
        raise

# Tipo anotado para la inyección de dependencia de MongoDB
SMongoDB = Annotated[motor.motor_asyncio.AsyncIOMotorDatabase, Depends(get_mongodb_db)]
