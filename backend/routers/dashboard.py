from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from database import get_db
from models import Medicine, Sale

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/today-sales")
def get_today_sales(db: Session = Depends(get_db)):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    total = db.query(func.sum(Sale.total_amount)).filter(Sale.sale_date >= today_start).scalar()
    return {"today_sales": total or 0.0}

@router.get("/items-sold")
def get_items_sold(db: Session = Depends(get_db)):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    total = db.query(func.sum(Sale.quantity_sold)).filter(Sale.sale_date >= today_start).scalar()
    return {"items_sold": total or 0}

@router.get("/low-stock")
def get_low_stock(db: Session = Depends(get_db)):
    count = db.query(func.count(Medicine.id)).filter(Medicine.status == "Low Stock").scalar()
    return {"low_stock_count": count or 0}

@router.get("/purchase-summary")
def get_purchase_summary(db: Session = Depends(get_db)):
    total = db.query(func.sum(Medicine.quantity * Medicine.price)).scalar()
    return {"total_inventory_value": total or 0.0}

@router.get("/recent-sales")
def get_recent_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).order_by(Sale.sale_date.desc()).limit(5).all()
    return [{
        "id": s.id,
        "medicine_name": s.medicine.name if s.medicine else "Unknown",
        "quantity": s.quantity_sold,
        "amount": s.total_amount,
        "date": s.sale_date
    } for s in sales]

@router.post("/dummy-sale")
def create_dummy_sale(medicine_id: int, qty: int, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if med and med.quantity >= qty:
        amount = med.price * qty
        sale = Sale(medicine_id=med.id, quantity_sold=qty, total_amount=amount)
        db.add(sale)
        
        med.quantity -= qty
        from services.inventory_service import update_medicine_status
        med = update_medicine_status(med)
        
        try:
            db.commit()
            return {"msg": "Sale recorded"}
        except Exception as e:
            db.rollback()
            return {"msg": f"Failed due to internal error: {str(e)}"}
    return {"msg": "Failed. Insufficient stock."}
