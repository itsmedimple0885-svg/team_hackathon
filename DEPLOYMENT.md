# Public deployment

## Deploy the backend on Render

1. Create a Render account with GitHub and select this repository.
2. Choose **Blueprint** and use `render.yaml`.
3. Set `DATABASE_URL` to a hosted PostgreSQL connection string. Leaving it unset uses local SQLite, which is not persistent across restarts.
4. Set `FRONTEND_ORIGIN` to the public frontend URL after the frontend is deployed.
5. Keep `USE_LOCAL_FALLBACK=true` unless `AI_ENDPOINT` and `AI_KEY` are configured.
6. Add `JIRA_EMAIL` and `JIRA_API_TOKEN` only if Jira issue creation is required.

Verify the backend at `/health`. Its URL will look like:

```text
https://team-hackathon-backend.onrender.com
```

The frontend is a standard Vite application. Run it locally from `frontend` with `npm run dev`, or build it with `npm run build` and serve the generated `dist` directory using any static web host.

Set `VITE_API_URL` to the Render backend URL, without a trailing slash, in the frontend host's environment settings.

Never commit API keys or database credentials. Add them only in hosting-provider environment settings.
