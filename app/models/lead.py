from sqlalchemy import Column,Integer,DateTime,String
from datetime import datetime
from app.database.base import Base

class Lead(Base):
    __tablename__="leads"
    id= Column(Integer,primary_key=True,index=True)
    name= Column(String,nullable=False)
    email= Column(String,nullable=False,unique=True,index=True)
    phone= Column(String,nullable=True)
    created_at= Column(DateTime,default=datetime.utcnow)
    source= Column(String,nullable=False)
    status=Column(String,default="new")