from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    batch_number = Column(String)
    expiry_date = Column(DateTime)
    quantity = Column(Integer, default=0)
    price = Column(Float, default=0.0)
    status = Column(String, default="Active") # Active, Low Stock, Expired, Out of Stock
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    quantity_sold = Column(Integer)
    total_amount = Column(Float)
    sale_date = Column(DateTime, default=datetime.datetime.utcnow)

    medicine = relationship("Medicine")
