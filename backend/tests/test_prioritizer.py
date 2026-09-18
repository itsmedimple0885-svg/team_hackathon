import json
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from app.prioritizer import _normalize_ai_response, prioritize_items


class PrioritizerTests(unittest.IsolatedAsyncioTestCase):
    async def test_fallback_scores_are_returned_when_ai_is_missing(self):
        items = [{"id": "INC-1001", "title": "Payment timeout"}, {"id": "JIRA-882", "title": "Security review"}]
        result = await prioritize_items(items, {"team": "Platform"})
        self.assertEqual(result[0]["item_id"], "INC-1001")
        self.assertEqual(result[0]["score"], 100)
        self.assertIn("Fallback heuristic", result[0]["rationale"])

    def test_ai_response_is_normalized(self):
        payload = [
            {"item_id": "A1", "score": 91, "confidence": 0.9, "rationale": "high impact", "tags": ["incident"]},
            {"item_id": "A2", "score": 70, "confidence": 0.7, "rationale": "medium", "tags": ["ticket"]},
        ]
        norm = _normalize_ai_response(payload)
        self.assertEqual(len(norm), 2)
        self.assertEqual(norm[0]["score"], 91.0)
        self.assertEqual(norm[0]["confidence"], 0.9)

    async def test_ai_response_is_used_when_available(self):
        fake_payload = [{"item_id": "A1", "score": 95, "confidence": 0.95, "rationale": "high impact", "tags": ["critical"]}]

        with patch("app.prioritizer.AISettings.from_env") as mock_settings, patch("app.prioritizer.httpx.AsyncClient") as mock_client:
            mock_settings.return_value = type(
                "Cfg",
                (),
                {
                    "use_local_fallback": False,
                    "is_configured": True,
                    "api_key": "k",
                    "model": "claude-fable-5-1",
                    "messages_url": "https://example.test/anthropic/v1/messages",
                },
            )()
            mock_response = MagicMock()
            mock_response.json.return_value = {"content": [{"text": json.dumps(fake_payload)}]}
            mock_response.raise_for_status.return_value = None
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)

            result = await prioritize_items([{"id": "A1", "title": "sample"}], {"team": "platform"})
            self.assertEqual(result[0]["score"], 95.0)
            self.assertEqual(result[0]["confidence"], 0.95)


if __name__ == "__main__":
    unittest.main()
