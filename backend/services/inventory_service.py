from sqlalchemy.orm import Session
from datetime import datetime
from models import Medicine
from schemas import MedicineCreate, MedicineUpdate

LOW_STOCK_THRESHOLD = 20

def update_medicine_status(medicine: Medicine):
    # Auto status logic
    now = datetime.utcnow()
    expr_date = medicine.expiry_date
    if expr_date and getattr(expr_date, 'tzinfo', None) is not None:
        expr_date = expr_date.replace(tzinfo=None)

    if medicine.quantity == 0:
        medicine.status = "Out of Stock"
    elif expr_date and expr_date < now:
        medicine.status = "Expired"
    elif medicine.quantity < LOW_STOCK_THRESHOLD:
        medicine.status = "Low Stock"
    else:
        medicine.status = "Active"
    return medicine

def check_all_medicines_status(db: Session):
    medicines = db.query(Medicine).all()
    for med in medicines:
        med = update_medicine_status(med)
    db.commit()

def create_medicine(db: Session, medicine: MedicineCreate) -> Medicine:
    db_med = Medicine(**medicine.model_dump())
    db_med = update_medicine_status(db_med)
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med

def get_medicine(db: Session, medicine_id: int):
    return db.query(Medicine).filter(Medicine.id == medicine_id).first()

def get_medicines(db: Session, skip: int = 0, limit: int = 100, search: str = None, status: str = None):
    query = db.query(Medicine)
    if search:
        query = query.filter(Medicine.name.ilike(f"%{search}%"))
    if status:
        query = query.filter(Medicine.status == status)
    return query.offset(skip).limit(limit).all()

def update_medicine(db: Session, medicine_id: int, updates: MedicineUpdate):
    db_med = get_medicine(db, medicine_id)
    if not db_med:
        return None
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_med, key, value)
    
    db_med = update_medicine_status(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med
