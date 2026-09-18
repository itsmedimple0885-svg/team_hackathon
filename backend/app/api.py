import os
from typing import Any

import httpx
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from .db import get_db
from .models import PriorityRun, WorkItem
from .prioritizer import prioritize_items
from .jira import create_issue, fetch_public_issues
from .schemas import DashboardItem, DashboardRequest, JiraCreateRequest, JiraImportRequest, PrioritizeRequest

router = APIRouter()


def _score_level(score: float) -> str:
    if score >= 90:
        return "CRITICAL"
    if score >= 75:
        return "HIGH"
    return "MEDIUM"


def _tone(score: float) -> str:
    if score >= 90:
        return "critical"
    if score >= 75:
        return "high"
    return "medium"


def _persist_item_and_priority(db: Session, item: Any, index: int, priority: dict | None = None) -> WorkItem:
    source_id = str(item.id)
    work_item = db.query(WorkItem).filter(WorkItem.source_id == source_id).first()

    if work_item is None:
        work_item = WorkItem(
            source=item.source or "System",
            source_id=source_id,
            title=item.title,
            description=getattr(item, "description", None),
            metadata_={"source": item.source or "System", "index": index},
        )
        db.add(work_item)
        db.commit()
        db.refresh(work_item)

    if priority is not None:
        existing_run = db.query(PriorityRun).filter(PriorityRun.item_id == work_item.id).order_by(PriorityRun.created_at.desc()).first()
        if existing_run is None or existing_run.score != int(priority.get("score", 0)):
            run = PriorityRun(
                item_id=work_item.id,
                score=int(priority.get("score", 0)),
                confidence=str(priority.get("confidence", 0)),
                rationale=priority.get("rationale") or {},
            )
            db.add(run)
            db.commit()

    return work_item


@router.post('/ingest')
async def ingest(payload: dict = Body(...)):
    # Validate and persist payload (stub)
    # TODO: persist to DB and index
    return {"status": "ingested", "received": payload.get('source')}


@router.post('/integrations/jira/import')
async def import_jira(request: JiraImportRequest, db: Session = Depends(get_db)):
    project_key = request.project_key.strip()
    if not project_key:
        raise HTTPException(status_code=422, detail="project_key is required.")

    try:
        items = await fetch_public_issues(
            request.jira_url,
            f'project = "{project_key}" ORDER BY updated DESC',
            request.max_results,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=f"Unable to read Jira: {exc}") from exc

    priorities = await prioritize_items(items, request.snapshot or {})
    persisted = []
    for index, item in enumerate(items):
        priority = priorities[index] if index < len(priorities) else None
        work_item = _persist_item_and_priority(db, DashboardItem(**item), index, priority)
        persisted.append({
            "id": item["id"],
            "title": item["title"],
            "status": item["status"],
            "work_item_id": work_item.id,
            "priority": priority,
        })

    return {
        "source": "Jira",
        "project": project_key,
        "count": len(persisted),
        "items": persisted,
    }


@router.post('/integrations/jira/issues')
async def create_jira_issues(request: JiraCreateRequest):
    if not request.tickets:
        raise HTTPException(status_code=422, detail="At least one Jira ticket is required.")

    email = os.getenv("JIRA_EMAIL")
    api_token = os.getenv("JIRA_API_TOKEN")
    created = []
    try:
        for ticket in request.tickets:
            summary = (ticket.get("summary") or "").strip()
            description = (ticket.get("description") or summary).strip()
            priority = (ticket.get("priority") or "High").strip()
            if not summary:
                raise ValueError("Each Jira ticket requires a summary.")
            issue = await create_issue(
                request.jira_url,
                email,
                api_token,
                request.project_key.strip(),
                summary,
                description,
                priority,
            )
            created.append({
                "key": issue.get("key"),
                "id": issue.get("id"),
                "url": f"{request.jira_url.rstrip('/')}/browse/{issue.get('key')}",
                "summary": summary,
                "priority": priority,
            })
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=f"Unable to create Jira issue: {exc}") from exc

    return {"source": "Jira", "project": request.project_key, "count": len(created), "items": created}


@router.post('/prioritize')
async def prioritize(request: PrioritizeRequest, db: Session = Depends(get_db)):
    result = await prioritize_items(request.items, request.snapshot or {})
    for idx, item in enumerate(request.items):
        priority = result[idx] if idx < len(result) else None
        _persist_item_and_priority(db, item, idx, priority)
    return {"priorities": result}


@router.post('/dashboard')
async def dashboard(request: DashboardRequest, db: Session = Depends(get_db)):
    priorities = await prioritize_items(request.items, request.snapshot or {})
    persisted = []
    for index, item in enumerate(request.items):
        priority = priorities[index] if index < len(priorities) else None
        work_item = _persist_item_and_priority(db, item, index, priority)
        persisted.append({"work_item": work_item, "priority": priority})

    db_rows = []
    for entry in persisted:
        wi = entry["work_item"]
        priority = entry["priority"] or {}
        score = float(priority.get("score", 80))
        confidence = float(priority.get("confidence", 0.8) or 0.8)
        db_rows.append({
            "id": wi.id,
            "title": wi.title,
            "source": wi.source,
            "owner": wi.owner_id or "Platform Team",
            "due": wi.due_date or "Next Week",
            "score": score,
            "confidence": confidence,
            "rationale": priority.get("rationale") or "AI-ranked item.",
            "tags": priority.get("tags") or [],
        })

    db_rows.sort(key=lambda row: row["score"], reverse=True)

    personal_rows = []
    for index, row in enumerate(db_rows):
        personal_rows.append({
            "rank": index + 1,
            "title": row["title"],
            "source": row["source"],
            "sourceMeta": f"Priority score {row['score']}",
            "score": round(row["score"] / 10, 1),
            "level": _score_level(row["score"]),
            "due": row["due"],
            "team": row["owner"],
            "action": "View Details",
            "tone": _tone(row["score"]),
        })

    team_rows = []
    for index, row in enumerate(db_rows[:5]):
        team_rows.append({
            "name": row["title"],
            "owner": row["owner"],
            "type": "INCIDENT" if index == 0 else "JIRA",
            "due": row["due"],
            "score": "P5" if index == 0 else ("AJ" if index == 1 else "RK" if index == 2 else "NK" if index == 3 else "VR"),
            "progress": int(min(100, max(25, row["score"]))),
        })

    action_rows = []
    for index, row in enumerate(db_rows):
        risk = _score_level(row["score"]).title() if row["score"] >= 75 else "Medium"
        action_rows.append({
            "id": f"ACTION-{index + 1:03d}",
            "title": row["title"],
            "owners": [row["owner"], "System"],
            "due": row["due"],
            "risk": risk,
            "confidence": f"{min(99, max(70, int(row['confidence'] * 100)))}%",
            "description": row["rationale"],
            "status": "pending",
        })

    return {
        "personal": {
            "summary": {
                "openItems": len(personal_rows),
                "highPriority": sum(1 for row in personal_rows if row["level"] in {"CRITICAL", "HIGH"}),
                "todayActions": len(personal_rows),
                "avgScore": f"{sum(row['score'] for row in personal_rows) / max(1, len(personal_rows)):.1f}/10",
            },
            "rows": personal_rows,
        },
        "team": {
            "summary": {
                "openItems": len(team_rows),
                "teamWorkload": "68%",
                "blockers": 5,
                "p0p1": 2,
            },
            "rows": team_rows,
        },
        "actions": {
            "summary": {
                "todayActions": len(action_rows),
                "confidence": "94%",
                "sourceTraced": 4,
                "resolved": 2,
            },
            "rows": action_rows,
        },
    }
