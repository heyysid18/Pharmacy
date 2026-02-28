from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import MedicineOut, MedicineCreate, MedicineUpdate, MedicineStatusUpdate
from services import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=List[MedicineOut])
def get_inventory(skip: int = 0, limit: int = 100, search: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    inventory_service.check_all_medicines_status(db)
    return inventory_service.get_medicines(db, skip=skip, limit=limit, search=search, status=status)

@router.get("/{id}", response_model=MedicineOut)
def get_medicine(id: int, db: Session = Depends(get_db)):
    med = inventory_service.get_medicine(db, id)
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return med

@router.post("", response_model=MedicineOut, status_code=201)
def create_medicine(medicine: MedicineCreate, db: Session = Depends(get_db)):
    return inventory_service.create_medicine(db, medicine)

@router.put("/{id}", response_model=MedicineOut)
def update_medicine(id: int, updates: MedicineUpdate, db: Session = Depends(get_db)):
    med = inventory_service.update_medicine(db, id, updates)
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return med

@router.patch("/{id}/status", response_model=MedicineOut)
def update_medicine_status(id: int, status_update: MedicineStatusUpdate, db: Session = Depends(get_db)):
    med = inventory_service.get_medicine(db, id)
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    med.status = status_update.status
    db.commit()
    db.refresh(med)
    return med
