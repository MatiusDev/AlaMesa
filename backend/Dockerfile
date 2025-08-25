# Se utiliza una imagen ligera (slim) para reducir el tamaño de la imagen final.
FROM python:3.12-slim
# Todas las operaciones posteriores se ejecutarán en este directorio.
WORKDIR /app
# Copiamos primero el archivo de requerimientos para aprovechar el cache de Docker.
# Si este archivo no cambia, Docker no volverá a instalar las dependencias.
COPY requirements.txt .
# Se utiliza --no-cache-dir para no almacenar el cache de pip, reduciendo el tamaño de la imagen.
RUN pip install --no-cache-dir -r requirements.txt
# Copiar el resto del código de la aplicación al contenedor
COPY . .
# El puerto 8000 es el que se configura en main.py para producción.
EXPOSE 8000
# El host 0.0.0.0 permite que la aplicación sea accesible desde fuera del contenedor.
CMD [ "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" ]

# Comandos
# Construir la imagen
# docker build -t alamesa-backend:latest ./backend

# Orquestar la aplicación con docker-compose
# Revisar archivo docker-compose.yml