from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LeadBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    source: str
    status: str = "new"

class LeadCreate(LeadBase):
    pass

class LeadResponse(LeadBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


from pydantic import BaseModel

class LeadGenerationRequest(BaseModel):
    keyword: str
    location: str
    limit: int = 10