import os
from dataclasses import dataclass
from urllib.parse import urlparse


@dataclass(frozen=True)
class AISettings:
    endpoint: str
    api_key: str | None
    model: str
    use_local_fallback: bool = False

    @classmethod
    def from_env(cls) -> "AISettings":
        endpoint = os.getenv("AI_ENDPOINT") or os.getenv("AZURE_OPENAI_ENDPOINT") or "https://ilb-3790-team29aifoundry.services.ai.azure.com"
        api_key = os.getenv("AI_KEY") or os.getenv("AZURE_OPENAI_KEY")
        model = os.getenv("AI_MODEL") or "claude-fable-5-1"
        use_local_fallback = os.getenv("USE_LOCAL_FALLBACK", "false").lower() in {"1", "true", "yes", "on"}

        endpoint = endpoint.strip().rstrip("/")
        parsed = urlparse(endpoint)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError(f"AI_ENDPOINT must be a valid URL, got: {endpoint!r}")

        return cls(
            endpoint=endpoint,
            api_key=api_key.strip() if api_key else None,
            model=model.strip() or "claude-fable-5-1",
            use_local_fallback=use_local_fallback,
        )

    @property
    def messages_url(self) -> str:
        if self.endpoint.endswith("/messages"):
            return self.endpoint
        if "/anthropic/v1" in self.endpoint:
            return f"{self.endpoint}/messages"
        return f"{self.endpoint}/anthropic/v1/messages"

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.endpoint and self.model)
