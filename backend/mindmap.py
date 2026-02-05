from typing import List, Optional, Dict, Any, Callable
import json
import logging
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from config import load_config

logger = logging.getLogger(__name__)

class MindmapNode(BaseModel):
    id: str = Field(description="节点的唯一标识符，英文 snake_case")
    text: str = Field(description="节点显示的中文文本内容")
    children: List[str] = Field(default_factory=list, description="子节点的 ID 列表，有序")

class MindmapUpdateResponse(BaseModel):
    summary: str = Field(description="对本次更新内容的简短自然语言总结")
    updated_nodes: List[MindmapNode] = Field(description="本次发生变化或新增的思维导图节点列表")

# Load config
config = load_config()

agent = Agent(
    OpenAIChatModel(
        model_name=config.MODEL_NAME,
        provider=OpenAIProvider(
            base_url=config.MODEL_SCOPE_URL,
            api_key=config.MODEL_SCOPE_API_KEY,
        )
    ),
    output_type=MindmapUpdateResponse
)

async def update_mindmap_agent(current_input: str, history_inputs: List[str], mindmap: Dict[str, MindmapNode]) -> MindmapUpdateResponse:
    # prompt construction
    current_mindmap_list = list(mindmap.values())
    
    # We serialize the mindmap to simple dicts for the prompt
    mindmap_json = json.dumps([n.model_dump() for n in current_mindmap_list], ensure_ascii=False, indent=2)
    history_json = json.dumps(history_inputs, ensure_ascii=False)
    
    prompt = f"""
你是一个专业的思维导图助手，负责根据用户的输入更新思维导图。请根据用户的当前输入和历史输入，以及当前的思维导图结构，智能地扩展和修改思维导图。

请你在当前的思维导图的基础上，根据用户新给出的文本，对原思维导图进行更新。你的修改会覆盖相同id的节点，你可以修改节点文本（例如将root节点的文本修改为中心关键词），调整节点之间的关系，添加新的节点等。确保思维导图结构合理，层级清晰。

用户的输入中可能有错误或不完整，你可以进行推断和补充，但推断要合理且不改变原意。

当前思维导图：
{mindmap_json}

用户历史输入：
{history_json}

用户当前输入：
{current_input}
"""
    logger.debug(f"Mindmap Update Prompt: {prompt}")
    
    try:
        # Run the agent
        result = await agent.run(prompt)

        logger.info(f"Mindmap Update Result: {result.output}")

        return result.output
    except Exception as e:
        logger.error(f"Error updating mindmap: {e}")
        raise e