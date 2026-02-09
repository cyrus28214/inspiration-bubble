from typing import List, Optional
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from config import load_config
import logging

logger = logging.getLogger(__name__)

# Load config
config = load_config()

class ThoughtAnalysisResponse(BaseModel):
    summary: str = Field(description="A concise summary of the user's input/thought.")
    keywords: List[str] = Field(description="A list of 3-5 keywords extracted from the input.")

agent = Agent(
    OpenAIChatModel(
        model_name=config.MODEL_NAME,
        provider=OpenAIProvider(
            base_url=config.MODEL_SCOPE_URL,
            api_key=config.MODEL_SCOPE_API_KEY,
        )
    ),
    output_type=ThoughtAnalysisResponse,
    system_prompt="你是一个擅长提炼想法的专家。你的目标是将用户的输入总结为一个简洁的想法摘要，并提取相关的关键词/标签。请始终使用中文回复。"
)

async def analyze_thought_agent(text: str) -> ThoughtAnalysisResponse:
    prompt = f"Please analyze the following input:\n{text}"
    result = await agent.run(prompt)
    return result.output
