from typing import List, Dict
import json
import logging
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from config import load_config
from mindmap import MindmapNode

logger = logging.getLogger(__name__)

config = load_config()


class InspirationSuggestion(BaseModel):
    title: str = Field(description="灵感标题，简短概括")
    description: str = Field(description="灵感描述，解释这个灵感的具体内容和价值")
    reason: str = Field(description="推荐理由，为什么这个灵感与当前话题相关")
    node_id: str = Field(description="该灵感对应的思维导图节点ID，英文 snake_case，唯一且不与已有节点重复")
    parent_node_id: str = Field(description="建议挂载到的父节点ID，必须是当前思维导图中已存在的节点ID")


class InspirationRecommendResponse(BaseModel):
    suggestions: List[InspirationSuggestion] = Field(
        description="推荐的灵感列表，3-5个"
    )


agent = Agent(
    OpenAIChatModel(
        model_name=config.MODEL_NAME,
        provider=OpenAIProvider(
            base_url=config.MODEL_SCOPE_URL,
            api_key=config.MODEL_SCOPE_API_KEY,
        ),
    ),
    output_type=InspirationRecommendResponse,
    system_prompt=(
        "你是一个创意灵感推荐专家。你的任务是根据用户当前的文本输入和思维导图结构，"
        "推荐3到5个具有启发性和创新性的灵感。"
        "这些灵感必须与当前话题相关但不能与用户已有的内容重复。"
        "灵感应该能够帮助用户拓展思路、发现新角度或深化已有想法。"
        "请始终使用中文回复。"
    ),
)


async def recommend_inspirations(
    messages: List[str],
    mindmap: Dict[str, MindmapNode],
) -> InspirationRecommendResponse:
    current_mindmap_list = list(mindmap.values())
    mindmap_json = json.dumps(
        [n.model_dump() for n in current_mindmap_list], ensure_ascii=False, indent=2
    )

    # Collect all existing node texts to explicitly tell LLM what to avoid
    existing_texts = [n.text for n in current_mindmap_list]
    existing_texts_str = "、".join(existing_texts) if existing_texts else "无"

    all_messages = "\n".join(f"- {m}" for m in messages) if messages else "无"

    prompt = f"""请根据以下信息，为用户推荐3到5个灵感。

## 用户输入历史
{all_messages}

## 当前思维导图结构
{mindmap_json}

## 已有内容（不可重复）
{existing_texts_str}

## 要求
1. 推荐的灵感必须与当前话题相关
2. 不能与用户输入中已有的内容重复
3. 不能与思维导图中已有的节点重复
4. 每个灵感要有明确的标题、具体描述和推荐理由
5. 灵感应具有启发性，能帮助用户从新角度思考问题
6. 推荐3到5个灵感
7. 每个灵感必须指定一个 node_id（英文 snake_case，不与已有节点重复）
8. 每个灵感必须指定一个 parent_node_id，表示建议将该灵感挂载到思维导图中哪个已有节点下面，parent_node_id 必须是当前思维导图中已存在的节点 ID
"""

    logger.debug(f"Inspiration Recommend Prompt: {prompt}")

    try:
        result = await agent.run(prompt)
        logger.info(f"Inspiration Recommend Result: {result.output}")
        return result.output
    except Exception as e:
        logger.error(f"Error recommending inspirations: {e}")
        raise e
