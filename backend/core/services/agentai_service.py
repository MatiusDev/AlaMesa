import openai
import json
import os

from fastapi import Depends
from typing import Annotated

from core.utils.constants.prompts import PROMPTS
from core.database.mongodb_driver import SMongoDB

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
      
      #print(response)
      #mongo_content = {
      #  "name": response["name"],
      #  f"{site}": response
      #}
      # await self.mongodb["Restaurant"].insert_one(mongo_content)

      return response
    except Exception as e:
      raise Exception(status_code=500, detail=f"Error al procesar con OpenAI: {str(e)}")
    
SAgentAIService = Annotated[AgentAIService, Depends(AgentAIService)]