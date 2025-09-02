# --- Etapa de Construcción ---
FROM node:22-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Definir los argumentos que se pueden pasar durante la compilación
ARG VITE_API_BASE_URL=/api
ARG VITE_GOOGLE_MAPS_API_KEY

# Exponer los argumentos como variables de entorno para que Vite pueda usarlos
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

# Construir la aplicación para producción
RUN npm run build

# --- Etapa de Servir ---
FROM nginx:stable-alpine

# Copiar la configuración personalizada de Nginx (opcional, pero buena práctica)
# Si tienes un archivo nginx.conf personalizado en tu directorio frontend,
# descomenta la siguiente línea y asegúrate de que el archivo exista.
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Eliminar la configuración predeterminada de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar una configuración personalizada de Nginx para servir los archivos estáticos
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear una configuración simple para Nginx que sirva los archivos estáticos
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80, que es el puerto predeterminado de Nginx
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
