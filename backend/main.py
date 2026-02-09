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

from mindmap import MindmapUpdateResponse, MindmapNode, update_mindmap_agent
from thought import analyze_thought_agent, ThoughtAnalysisResponse

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

class ThoughtRequest(BaseModel):
    text: str

@app.post("/api/v1/thought/analyze", response_model=ThoughtAnalysisResponse)
async def analyze_thought(request: ThoughtRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    return await analyze_thought_agent(request.text)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
