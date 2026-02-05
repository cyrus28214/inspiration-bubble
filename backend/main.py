from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import httpx
from dotenv import load_dotenv
from models import *
from logger import setup_logger

from config import load_config
import logging

load_dotenv()
setup_logger()
config = load_config()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Inspiration Bubble API",
    version="1.0.0",
    description="API for Inspiration Bubble"
)

# async def call_model_scope(prompt: str):
#     """Helper to call ModelScope API"""
#     if not config.MODEL_SCOPE_API_KEY:
#         raise HTTPException(status_code=500, detail="MODEL_SCOPE_API_KEY not configured")
        
#     payload = {
#         "model": config.MODEL_NAME,
#         "messages": [{"role": "user", "content": prompt}],
#         "enable_thinking": False
#     }
    
#     headers = {
#         "Content-Type": "application/json",
#         "Authorization": f"Bearer {config.MODEL_SCOPE_API_KEY}"
#     }
    
#     async with httpx.AsyncClient() as client:
#         try:
#             logger.info(f"[ModelScope] Sending request to {config.MODEL_SCOPE_URL} with payload: {json.dumps(payload, ensure_ascii=False)[:200]}...")
#             response = await client.post(config.MODEL_SCOPE_URL, json=payload, headers=headers, timeout=60.0)
#             if response.status_code != 200:
#                 logger.error(f"[ModelScope] Error Status: {response.status_code}, Body: {response.text}")

#             response.raise_for_status()
#             data = response.json()
#             content = data['choices'][0]['message']['content']
#             logger.info(f"[ModelScope] Received content: {content[:200]}...")
            
#             # Clean up potential markdown code blocks if AI returns them
#             if content.startswith("```json"):
#                 content = content[7:]
#             if content.startswith("```"):
#                 content = content[3:]
#             if content.endswith("```"):
#                 content = content[:-3]
                
#             return json.loads(content.strip())
#         except Exception as e:
#             logger.error(f"ModelScope Error: {e}")
#             if "response" in locals():
#                 logger.error(f"Response: {response.text}")
#             raise HTTPException(status_code=500, detail=f"AI Provider Error: {str(e)}")


# @app.post("/api/v1/analyze", response_model=AnalyzeResponse)
# async def analyze_idea(request: AnalyzeRequest):
#     if not request.text.strip():
#         raise HTTPException(status_code=400, detail="Text cannot be empty")

#     # 构建上下文信息字符串
#     existing_keywords_str = ", ".join(request.context_history) if request.context_history else "无"

#     prompt = f"""你是专业的讨论内容梳理助手，需处理各类口头 / 文字讨论内容，严格基于原文完成核心信息提取与层级化思维导图生成。
# 请直接返回 JSON 结果，严禁输出任何 Markdown 代码块或解释性文字。

# ## 核心规则：
# 1. **关键词提取**：从讨论内容中提取核心关键词，拒绝冗余，不遗漏核心点。
# 2. **逻辑层级**：梳理信息层级（Level 1-3+），Level 1 为核心主题。
# 3. **结构化生成**：仅包含提取的关键词，无需长句。
# 4. **严禁加工**：仅提炼原文信息，不做任何引申或杜撰。

# ## 技术要求：
# 1. **跨灵感关联**：尝试建立本次关键词与现有关键词 [{existing_keywords_str}] 之间的联系。
# 2. **语言一致性**：必须全部使用中文输出。

# ## JSON 结构要求：
# {{
#   "summary": "根节点内容", 
#   "recent_summary": "最近输入内容的简短摘要（不超过20字）", 
#   "keywords": [
#     {{"name": "关键词", "level": 层级(int), "parent": "父节点名或null"}},
#     ...
#   ], 
#   "connections": [
#     {{"source": "源节点", "target": "目标节点", "strength": 1-10}}
#   ]
# }}

# 内容：{{request.text}}"""

#     # Call the model
#     data = await call_model_scope(prompt)
    
#     # Hydrate thoughts structure for the response
#     # Map the AI response to our Pydantic models
#     keywords_data = []
#     for k in data.get("keywords", []):
#          keywords_data.append(Keyword(
#              name=k.get("name"),
#              level=k.get("level", 1),
#              parent=k.get("parent")
#          ))

#     connections_data = []
#     for c in data.get("connections", []):
#         connections_data.append(Connection(
#             source=c.get("source"),
#             target=c.get("target"),
#             strength=float(c.get("strength", 1.0))
#         ))

#     thoughts = [Thought(
#         original=request.text,
#         summary=data.get("summary", ""),
#         keywords=[k.name for k in keywords_data]
#     )]
    
#     return AnalyzeResponse(
#         summary=data.get("summary", ""),
#         keywords=keywords_data,
#         connections=connections_data,
#         thoughts=thoughts,
#         inspiration=[]
#     )

# @app.post("/api/v1/summarize", response_model=SummarizeResponse)
# async def summarize_content(request: SummarizeRequest):
#     prompt = f"""你是一个信息提炼专家。请根据以下网页的标题和片段内容，生成一个极简总结（30字以内）并提取3个核心关键词。
# 要求：严格以 JSON 格式返回。
# JSON 结构：{{ "summary": "总结内容", "tags": ["标签1", "标签2", "标签3"] }}

# 标题：{request.title}
# 片段：{request.content}"""
    
#     data = await call_model_scope(prompt)
    
#     summary_text = data.get("summary") or data.get("brief") or "No summary available"
#     tags_list = data.get("tags", [])
    
#     return SummarizeResponse(summary=summary_text, tags=tags_list)

# @app.get("/api/v1/inspiration", response_model=InspirationResponse)
# async def get_inspiration(query: str):
#     logger.info(f"[Inspiration] Received query: {query}")
    
#     items = []
    
#     # Attempt Serphouse Search if Key is present
#     if settings.SERPHOUSE_API_KEY:
#         search_url = settings.SERPHOUSE_SEARCH_URL
#         params = {
#             "q": query,
#             "num": 5,
#             "api_token": settings.SERPHOUSE_API_KEY
#         }
        
#         logger.info(f"[Inspiration] Calling Serphouse for query: {query}")

#         async with httpx.AsyncClient() as client:
#             try:
#                 response = await client.get(search_url, params=params, timeout=30.0)
#                 if response.status_code == 200:
#                     data = response.json()
#                     logger.info(f"[Inspiration] Serphouse Raw Response (Snippet): {json.dumps(data, ensure_ascii=False)[:200]}...")
                    
#                     # Parse Serphouse response format
#                     results = data["results"]["results"]["organic"]

#                     for res in results[:5]:
#                         items.append(InspirationItem(
#                             title=res.get("title", "No Title"),
#                             link=res.get("link", "#"),
#                             snippet=res.get("snippet", "") or res.get("description", "")
#                         ))
#                 else:
#                     logger.error(f"[Inspiration] Serphouse Error: {response.status_code} - {response.text}")
#             except Exception as e:
#                 logger.error(f"[Inspiration] Serphouse Search Exception: {e}")

#     # Return whatever items we found (or empty list)
#     return InspirationResponse(items=items)

from mindmap import MindmapUpdateResponse, MindmapNode, update_mindmap_agent

class MindmapUpdateRequest(BaseModel):
    messages: List[str]
    mindmap: Optional[dict] = {}

@app.post("/api/v1/mindmap/update", response_model=MindmapUpdateResponse)
async def update_mindmap(request: MindmapUpdateRequest):
    messages = request.messages
    if len(messages) <= 0:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")
    
    current_input = messages[-1]
    history_inputs = messages[:-1]

    return await update_mindmap_agent(
        current_input=current_input,
        history_inputs=history_inputs,
        mindmap={k: MindmapNode.model_validate(v) for k, v in (request.mindmap or {}).items()}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
