Backend (FastAPI)

Quickstart:
1. Create virtualenv: python -m venv .venv && .\.venv\Scripts\activate
2. pip install -r requirements.txt
3. Export env vars, including the Anthropic-compatible Azure AI Foundry settings:
   - AI_ENDPOINT=https://ilb-3790-team29aifoundry.services.ai.azure.com
   - AI_KEY=<your-foundry-api-key>
   - AI_MODEL=claude-fable-5-1
   - DATABASE_URL=...
   - AZURE_SEARCH_ENDPOINT=...
   - AZURE_SEARCH_API_KEY=...
4. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

The /prioritize endpoint now calls the Azure AI Foundry Anthropic-compatible endpoint using the configured AI_MODEL and AI_KEY. If the AI service is unavailable, the app automatically falls back to the heuristic scoring logic.

Endpoints stubbed: /health, /ingest, /prioritize, /items/{id}/audit
