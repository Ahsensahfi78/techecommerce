from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin, get_current_user, get_optional_user
from ..database import get_db
from .coupons import coupon_discount

router = APIRouter(prefix="/api/orders", tags=["orders"])

ORDER_STATUSES = {"pending", "paid", "shipped", "delivered", "cancelled"}


def _to_out(order: models.Order) -> schemas.OrderOut:
    return schemas.OrderOut.model_validate(order)


def _order_or_404(db: Session, order_id: int) -> models.Order:
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("", response_model=List[schemas.OrderOut])
def list_orders(
    status: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    query = db.query(models.Order)
    if status:
        if status not in ORDER_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid status")
        query = query.filter(models.Order.status == status)
    return (
        query.order_by(models.Order.created_at.desc()).limit(limit).all()
    )


@router.get("/mine", response_model=List[schemas.OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return orders


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    order = _order_or_404(db, order_id)
    if not user.is_admin and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    return order


@router.post("", response_model=schemas.OrderOut, status_code=201)
def create_order(
    payload: schemas.OrderCreate,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user),
):
    total = 0.0
    items_out = []
    discount = 0.0
    coupon_code = None

    for item in payload.items:
        product = (
            db.query(models.Product)
            .filter(models.Product.id == item.product_id)
            .first()
        )
        if not product:
            raise HTTPException(
                status_code=400, detail=f"Product {item.product_id} not found"
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for '{product.name}'. Available: {product.stock}",
            )

        line_total = product.price * item.quantity
        total += line_total
        items_out.append(
            models.OrderItem(
                product_id=product.id,
                product_name=product.name,
                price=product.price,
                quantity=item.quantity,
                image_url=product.image_url,
            )
        )
        product.stock -= item.quantity

    if payload.coupon_code:
        coupon = (
            db.query(models.Coupon)
            .filter(models.Coupon.code.ilike(payload.coupon_code.strip()))
            .first()
        )
        if not coupon:
            raise HTTPException(status_code=400, detail="Coupon not found")
        discount = coupon_discount(coupon, total)
        coupon_code = coupon.code

    order = models.Order(
        user_id=user.id if user else None,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email.lower(),
        customer_phone=payload.customer_phone,
        shipping_address=payload.shipping_address,
        city=payload.city,
        postal_code=payload.postal_code,
        status="pending",
        total=round(total - discount, 2),
        discount=round(discount, 2),
        coupon_code=coupon_code,
    )
    order.items = items_out
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    if payload.status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    order = _order_or_404(db, order_id)
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=204)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    order = _order_or_404(db, order_id)
    db.delete(order)
    db.commit()
    return None


@router.get("/stats/sales-over-time")
def sales_over_time(
    days: int = 30,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    since = datetime.utcnow() - timedelta(days=days)
    orders = (
        db.query(models.Order)
        .filter(
            models.Order.created_at >= since,
            models.Order.status != "cancelled",
        )
        .all()
    )
    buckets: dict[str, dict] = {}
    for order in orders:
        key = order.created_at.strftime("%Y-%m-%d")
        b = buckets.setdefault(key, {"date": key, "revenue": 0.0, "orders": 0})
        b["revenue"] += order.total
        b["orders"] += 1
    return sorted(buckets.values(), key=lambda x: x["date"])
