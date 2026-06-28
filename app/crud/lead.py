from sqlalchemy.orm import Session
from app.models.lead import Lead
from app.schemas.lead import LeadCreate
from sqlalchemy.exc import IntegrityError


def create_lead(db:Session,lead:LeadCreate):
    new_lead=Lead(
        name=lead.name,
        email=lead.email,
        phone=lead.phone,
        source=lead.source,
        status=lead.status
    )
    try:
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)
        return new_lead
    except IntegrityError:
        db.rollback()
        raise 
def get_all_leads(db:Session):
    return db.query(Lead).all()

def get_lead_by_id(db: Session, lead_id: int):
    return db.query(Lead).filter(Lead.id == lead_id).first()

def update_lead_status(db:Session,lead_id:int,status:str):
    lead=db.query(Lead).filter(Lead.id==lead_id).first()
    if not lead:
        return None
    lead.status=status
    db.commit()
    db.refresh(lead)
    return lead
def delete_lead(db:Session,lead_id:int):
    lead=db.query(Lead).filter(Lead.id==lead_id).first()
    if not lead:
        return None
    db.delete(lead)
    db.commit()
    return True