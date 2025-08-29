import os
import motor.motor_asyncio
from dotenv import load_dotenv

# Cargar las variables de entorno del archivo .env
load_dotenv()

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

# Instancia única del driver para ser importada en otras partes de la aplicación
db_driver = MongoDriver()

# Ejemplo de cómo se usaría en otro archivo:
# from backend.core.database.mongodb_driver import db_driver
#
# async def alguna_funcion():
#     db = db_driver.get_database()
#     # ... hacer operaciones con la base de datos
