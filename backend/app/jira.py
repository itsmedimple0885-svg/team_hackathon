from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

import httpx


def jira_base_url(jira_url: str) -> str:
    parsed = urlparse(jira_url.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("jira_url must be a valid HTTP(S) URL.")
    return f"{parsed.scheme}://{parsed.netloc}"


def _description_text(value: Any) -> str | None:
    if isinstance(value, str):
        return value
    if not isinstance(value, dict):
        return None

    parts: list[str] = []

    def visit(node: Any) -> None:
        if isinstance(node, dict):
            if node.get("type") == "text" and node.get("text"):
                parts.append(str(node["text"]))
            for child in node.get("content", []):
                visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)

    visit(value)
    text = " ".join(" ".join(parts).split())
    return text or None


def map_issue(issue: dict[str, Any]) -> dict[str, Any]:
    fields = issue.get("fields") or {}
    assignee = fields.get("assignee") or {}
    status = fields.get("status") or {}
    return {
        "id": issue.get("key") or str(issue.get("id")),
        "title": fields.get("summary") or issue.get("key") or "Untitled Jira issue",
        "source": "Jira",
        "description": _description_text(fields.get("description")),
        "due_date": fields.get("duedate"),
        "owner": assignee.get("displayName") or assignee.get("emailAddress"),
        "status": status.get("name") or "Open",
        "metadata": {
            "jira_key": issue.get("key"),
            "jira_url": issue.get("self"),
            "project": (fields.get("project") or {}).get("key"),
            "priority": (fields.get("priority") or {}).get("name"),
            "labels": fields.get("labels") or [],
        },
    }


async def fetch_public_issues(jira_url: str, jql: str, max_results: int = 50) -> list[dict[str, Any]]:
    url = f"{jira_base_url(jira_url)}/rest/api/3/search/jql"
    params = {
        "jql": jql,
        "maxResults": max(1, min(max_results, 100)),
        "fields": "summary,description,duedate,assignee,status,project,priority,labels",
    }

    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        response = await client.get(url, params=params, headers={"Accept": "application/json"})

    if response.status_code in {401, 403}:
        raise PermissionError("Jira does not allow anonymous access to this project.")
    response.raise_for_status()
    payload = response.json()
    return [map_issue(issue) for issue in payload.get("issues", [])]


async def create_issue(
    jira_url: str,
    email: str | None,
    api_token: str | None,
    project_key: str,
    summary: str,
    description: str,
    priority: str,
) -> dict[str, Any]:
    if not email or not api_token:
        raise ValueError("JIRA_EMAIL and JIRA_API_TOKEN must be configured.")

    url = f"{jira_base_url(jira_url)}/rest/api/3/issue"
    payload = {
        "fields": {
            "project": {"key": project_key},
            "summary": summary,
            "description": {
                "type": "doc",
                "version": 1,
                "content": [{
                    "type": "paragraph",
                    "content": [{"type": "text", "text": description}],
                }],
            },
            "issuetype": {"name": "Task"},
            "priority": {"name": priority},
        }
    }

    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        response = await client.post(
            url,
            auth=(email, api_token),
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            json=payload,
        )

    if response.status_code in {401, 403}:
        raise PermissionError("Jira rejected the configured credentials or project permissions.")
    response.raise_for_status()
    return response.json()
