from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
import uuid

from app.auth.dependencies.auth import get_current_user
from app.schemas.lead import LeadGenerationRequest
from app.models.lead import Lead
from app.database.db import get_db
from app.schemas.lead import LeadCreate, LeadResponse
from app.crud.lead import (
    create_lead,
    get_all_leads,
    get_lead_by_id,
    update_lead_status,
    delete_lead
)

router = APIRouter(
    prefix="/leads",
    tags=["Leads"]
)




@router.post("/generate-leads")
def generate_leads(
    payload: LeadGenerationRequest,
    db: Session = Depends(get_db)
):
    generated = []

    for i in range(payload.limit):
        lead = Lead(
            name=f"{payload.keyword.title()} Business {i+1}",
            email=f"{uuid.uuid4().hex[:8]}@{payload.keyword.lower()}.com",
            phone=f"+91 900000{i:04}",
            source=f"{payload.keyword} - {payload.location}",
            status="new"
        )

        db.add(lead)
        generated.append(lead)

    db.commit()

    for lead in generated:
        db.refresh(lead)

    return generated





@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_new_lead(
    lead: LeadCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    try:
        return create_lead(db, lead)
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Lead with this email already exists"
        )

@router.get("/", response_model=List[LeadResponse])
def get_leads(
    db: Session = Depends(get_db)
):
    return get_all_leads(db)

@router.get("/{lead_id}", response_model=LeadResponse)
def get_single_lead(
    lead_id: int,
    db: Session = Depends(get_db)
):
    lead = get_lead_by_id(db, lead_id)

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    return lead

@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    status: str = Query(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    lead = update_lead_status(
        db,
        lead_id,
        status
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    return lead

@router.delete("/{lead_id}")
def delete_lead_by_id(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    success = delete_lead(
        db,
        lead_id
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    return {
        "message": "Lead deleted successfully"
    }

