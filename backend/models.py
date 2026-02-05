from typing import List, Optional
from pydantic import BaseModel

class Keyword(BaseModel):
    name: str
    level: int
    isCore: bool = False
    parent: Optional[str] = None

class Connection(BaseModel):
    source: str
    target: str
    strength: float = 1.0

class Thought(BaseModel):
    original: str
    summary: str
    keywords: List[str]

class InspirationItem(BaseModel):
    title: str
    link: str
    snippet: str

class AnalyzeRequest(BaseModel):
    text: str
    context_history: Optional[List[str]] = []

class AnalyzeResponse(BaseModel):
    summary: str
    keywords: List[Keyword]
    connections: List[Connection]
    thoughts: List[Thought]
    inspiration: List[InspirationItem]

class SummarizeRequest(BaseModel):
    title: str
    content: str

class SummarizeResponse(BaseModel):
    summary: str
    tags: List[str]

class InspirationResponse(BaseModel):
    items: List[InspirationItem]



