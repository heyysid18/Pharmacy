from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class MedicineBase(BaseModel):
    name: str
    batch_number: str
    expiry_date: datetime
    quantity: int
    price: float

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    status: Optional[str] = None

class MedicineStatusUpdate(BaseModel):
    status: str

class MedicineOut(MedicineBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginatedMedicine(BaseModel):
    data: list[MedicineOut]
    total: int
    skip: int
    limit: int

class SaleBase(BaseModel):
    medicine_id: int
    quantity_sold: int
    
class SaleCreate(SaleBase):
    pass

class SaleOut(SaleBase):
    id: int
    total_amount: float
    sale_date: datetime
    medicine: MedicineOut

    model_config = ConfigDict(from_attributes=True)
