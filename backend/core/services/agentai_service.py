import openai
import json
import os

from fastapi import Depends
from typing import Annotated

<<<<<<< HEAD
from core.utils.constants.prompts import PROMPTS

_openai_client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AgentAIService:
  async def format_to_json(self, text_content: str):
    try:
      response = await _openai_client.chat.completions.create(
        model="gpt-5-nano",
        response_format={"type": "json_object"},
        messages=[
          { "role": "system", "content": PROMPTS["FORMAT_RESTAURANT_DETAIL"]},
          {"role": "user", "content": text_content}
        ])
=======
from core.utils.constants.prompts import FORMAT_RESTAURANT_DETAIL

class AgentAIService:
  def __init__(self):
    self.client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
  async def format_to_json(self, text_content: str):
    try:
      response = await self.client.chat.completions.create(
      model="gpt-4-turbo", # O "gpt-o4"
      response_format={"type": "json_object"},
      messages=[
        { "role": "system", "content": FORMAT_RESTAURANT_DETAIL},
        {"role": "user", "content": text_content}
      ])
>>>>>>> a345c43 (NEW: Adding backend structure implementing scraping with openai analysis)
      token_usage = response.usage
      
      # Imprimir los detalles en la consola
      print("----- Uso de Tokens de OpenAI -----")
      print(f"Tokens del Prompt (entrada): {token_usage.prompt_tokens}")
      print(f"Tokens de Completion (salida): {token_usage.completion_tokens}")
      print(f"Tokens Totales: {token_usage.total_tokens}")
      print("---------------------------------")
      
      return json.loads(response.choices[0].message.content)
    except Exception as e:
      raise Exception(status_code=500, detail=f"Error al procesar con OpenAI: {str(e)}")
    
SAgentAIService = Annotated[AgentAIService, Depends(AgentAIService)]