import openai
import json
import os

from fastapi import Depends, HTTPException
from typing import Annotated

from core.utils.constants.prompts import PROMPTS
from core.database.mongodb_driver import SMongoDB
from core.utils.matching import find_similar_restaurant

_openai_client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AgentAIService:
  def __init__(self, mongodb: SMongoDB):
    self.mongodb = mongodb

  async def format_to_json(self, text_content: str, site: str):
    try:
      response = await _openai_client.chat.completions.create(
        model="gpt-5-nano",
        response_format={"type": "json_object"},
        messages=[
          { "role": "system", "content": PROMPTS["FORMAT_RESTAURANT_DETAIL"]},
          {"role": "user", "content": text_content}
        ])
      token_usage = response.usage
      
      # Imprimir los detalles en la consola
      print("----- Uso de Tokens de OpenAI -----")
      print(f"Tokens del Prompt (entrada): {token_usage.prompt_tokens}")
      print(f"Tokens de Completion (salida): {token_usage.completion_tokens}")
      print(f"Tokens Totales: {token_usage.total_tokens}")
      print("---------------------------------")

      response = json.loads(response.choices[0].message.content)

      restaurant_name = response.get("name")
      if not restaurant_name:
          # No podemos continuar si no hay nombre
          return response

      # Busca una coincidencia similar antes de guardar
      collection = self.mongodb["Restaurant"]
      matched_restaurant = await find_similar_restaurant(restaurant_name, collection)

      if matched_restaurant:
          # Si hay match, usamos su nombre y _id para actualizar
          print(f"Actualizando el restaurante existente '{matched_restaurant['name']}'")
          query = {"_id": matched_restaurant["_id"]}
          # Actualizamos el nombre por si el nuevo es ligeramente mejor y añadimos los datos del sitio
          update_data = {"$set": {"name": restaurant_name, f"{site}": response}}
      else:
          # Si no hay match, preparamos para insertar un nuevo documento
          print(f"No se encontraron coincidencias. Creando nuevo restaurante '{restaurant_name}'")
          query = {"name": restaurant_name} # Usamos el nombre para el upsert inicial
          update_data = {"$set": {"name": restaurant_name, f"{site}": response}}

      await collection.update_one(query, update_data, upsert=True)
      print(f"Restaurante '{restaurant_name}' guardado/actualizado en MongoDB.")

      return response
    except openai.APIError as e:
      error_message = "Error en la petición a la API de OpenAI."
      if (e.body):
        type_error = e.body.get('type')
        
        if (type_error == "insufficient_quota"):
          error_message = "Token no tiene fondos suficientes para realizar la petición."
        elif (type_error == "invalid_request_error"):
          error_message = "APIKEY inválida o petición malformada."
      raise HTTPException(status_code=500, detail=f"Error al procesar con OpenAI: {error_message}")
    except Exception as e:
      raise Exception(status_code=500, detail=f"Error al procesar con OpenAI: {str(e)}")
    
SAgentAIService = Annotated[AgentAIService, Depends(AgentAIService)]