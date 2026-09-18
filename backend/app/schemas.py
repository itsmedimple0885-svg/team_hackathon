from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class IngestPayload(BaseModel):
    source: str
    source_id: str
    title: str
    description: Optional[str]
    metadata: Optional[Dict[str, Any]]


class DashboardItem(BaseModel):
    id: str
    title: str
    source: Optional[str] = "System"
    description: Optional[str] = None
    due_date: Optional[str] = None
    owner: Optional[str] = None


class PrioritizeRequest(BaseModel):
    items: List[DashboardItem] = Field(default_factory=list)
    snapshot: Optional[Dict[str, Any]] = {}


class DashboardRequest(BaseModel):
    items: List[DashboardItem] = Field(default_factory=list)
    snapshot: Optional[Dict[str, Any]] = {}
    team: Optional[str] = None
    user: Optional[str] = None
