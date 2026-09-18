import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import router as api_router
from .db import engine
from .models import Base

app = FastAPI(title="Productivity Dashboard API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin
        for origin in [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            os.getenv("FRONTEND_ORIGIN"),
        ]
        if origin
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)


app.include_router(api_router, prefix="")


@app.get('/health')
async def health():
    return {"status": "ok"}
