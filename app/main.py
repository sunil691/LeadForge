from fastapi import FastAPI
from app.database.db import engine
from app.database.base import Base
from app.routers.lead import router as lead_router
from app.routers.auth import router as auth_router
from app.models import user, lead 



from app.models import lead

app =FastAPI(
    title="LeadForge API",
    description="Backend systeem for lead collection and mannagenet",
    version="1.0.0")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    
app.include_router(lead_router)


@app.get("/")
def health_check():
    return{"status":"LeadForge backend is running"}
app.include_router(auth_router)
