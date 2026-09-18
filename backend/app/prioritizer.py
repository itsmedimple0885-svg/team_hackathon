import json
import logging
from typing import Any, Dict, List

import httpx
from dotenv import load_dotenv

from .config import AISettings

load_dotenv()

logger = logging.getLogger(__name__)


def _item_to_mapping(item: Any) -> Dict[str, Any]:
    if isinstance(item, dict):
        return item
    if hasattr(item, "model_dump"):
        return item.model_dump()
    if hasattr(item, "dict"):
        return item.dict()
    if hasattr(item, "__dict__"):
        return dict(item.__dict__)
    return {"id": str(item)}


def _fallback_scores(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    mapped_items = [_item_to_mapping(item) for item in items]
    out: List[Dict[str, Any]] = []
    for index, item in enumerate(mapped_items):
        score = 100 - min(100, index * 10)
        out.append({
            "item_id": item.get("id") or item.get("item_id") or f"item-{index}",
            "score": score,
            "confidence": round(0.6 + 0.1 * (index % 3), 2),
            "rationale": "Fallback heuristic score because the AI service was unavailable.",
            "tags": [],
        })
    return out


def _normalize_ai_response(payload: Any) -> List[Dict[str, Any]]:
    if isinstance(payload, list):
        items = payload
    elif isinstance(payload, dict):
        items = payload.get("items", [payload])
    else:
        raise ValueError("AI response was not a JSON array or object.")

    normalized: List[Dict[str, Any]] = []
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            raise ValueError(f"AI response item at index {idx} was not an object.")
        normalized.append({
            "item_id": item.get("item_id") or item.get("id") or f"item-{idx}",
            "score": float(item.get("score", 0)) if item.get("score") is not None else 0,
            "confidence": float(item.get("confidence", 0.0)) if item.get("confidence") is not None else 0.0,
            "rationale": item.get("rationale") or "AI-generated rationale.",
            "tags": item.get("tags") or [],
        })
    return normalized


async def _query_claude(items: List[Dict[str, Any]], snapshot: Dict[str, Any]) -> List[Dict[str, Any]]:
    normalized_items = [_item_to_mapping(item) for item in items]
    settings = AISettings.from_env()
    if settings.use_local_fallback or not settings.is_configured:
        logger.info("Using local fallback for AI prioritization.")
        raise RuntimeError("AI configuration is incomplete; using local fallback.")

    prompt = json.dumps(
        {
            "items": normalized_items,
            "snapshot": snapshot,
            "instructions": "Return a JSON array of objects with item_id, score, confidence, rationale and tags. Scores must be numeric from 0 to 100.",
        },
        ensure_ascii=False,
    )

    payload = {
        "model": settings.model,
        "max_tokens": 512,
        "messages": [
            {"role": "user", "content": f"Prioritize these work items and return JSON only.\n\n{prompt}"}
        ],
    }

    headers = {
        "x-api-key": settings.api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(settings.messages_url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        body = response.json()

    text = "[]"
    content = body.get("content") or []
    if content and isinstance(content[0], dict):
        text = str(content[0].get("text", "[]"))

    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`\n ")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].lstrip()

    parsed = json.loads(cleaned)
    return _normalize_ai_response(parsed)


async def prioritize_items(items: List[Dict[str, Any]], snapshot: Dict[str, Any]):
    if not items:
        return []

    try:
        return await _query_claude(items, snapshot)
    except Exception as exc:
        logger.warning("AI prioritization failed. Falling back to heuristic scores: %s", exc)
        return _fallback_scores(items)
