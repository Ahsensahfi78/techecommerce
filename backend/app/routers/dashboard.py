from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(
    prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_admin)]
)


@router.get("/stats", response_model=schemas.DashboardStats)
def stats(db: Session = Depends(get_db)):
    total_revenue = (
        db.query(func.sum(models.Order.total))
        .filter(models.Order.status != "cancelled")
        .scalar()
        or 0.0
    )
    total_orders = db.query(models.Order).count()
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.User).count()
    pending_orders = (
        db.query(models.Order).filter(models.Order.status == "pending").count()
    )

    recent_orders = (
        db.query(models.Order)
        .order_by(models.Order.created_at.desc())
        .limit(8)
        .all()
    )

    low_stock = (
        db.query(models.Product).filter(models.Product.stock < 10).limit(8).all()
    )

    cat_counts = (
        db.query(models.Category.name, func.count(models.Product.id))
        .outerjoin(models.Product, models.Product.category_id == models.Category.id)
        .group_by(models.Category.id)
        .all()
    )
    category_counts = [
        {"category": name or "Uncategorized", "count": count}
        for name, count in cat_counts
    ]

    return schemas.DashboardStats(
        total_revenue=round(total_revenue, 2),
        total_orders=total_orders,
        total_products=total_products,
        total_customers=total_customers,
        pending_orders=pending_orders,
        recent_orders=recent_orders,
        low_stock_products=low_stock,
        category_counts=category_counts,
    )
