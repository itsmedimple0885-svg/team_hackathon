from fastapi import FastAPI, HTTPException

from .api import router as api_router
from .db import engine
from .models import Base

app = FastAPI(title="Productivity Dashboard API")


@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)


app.include_router(api_router, prefix="")


@app.get('/health')
async def health():
    return {"status": "ok"}
