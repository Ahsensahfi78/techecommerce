from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


def coupon_discount(coupon: models.Coupon, subtotal: float) -> float:
    """Validate a coupon against a subtotal and return the discount amount."""
    now = datetime.utcnow()
    if not coupon.active:
        raise HTTPException(status_code=400, detail="This coupon is not active")
    if coupon.expires_at and coupon.expires_at < now:
        raise HTTPException(status_code=400, detail="This coupon has expired")
    if subtotal < coupon.min_order:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order for {coupon.code} is Rs {coupon.min_order:.2f}",
        )
    if coupon.discount_type == "percent":
        discount = subtotal * coupon.discount_value / 100
    else:
        discount = coupon.discount_value
    return round(min(discount, subtotal), 2)


def _coupon_or_404(db: Session, coupon_id: int) -> models.Coupon:
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon


@router.get("", response_model=List[schemas.CouponOut])
def list_coupons(
    active: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    query = db.query(models.Coupon)
    if active is not None:
        query = query.filter(models.Coupon.active == active)
    return query.order_by(models.Coupon.created_at.desc()).all()


@router.post("", response_model=schemas.CouponOut, status_code=201)
def create_coupon(
    payload: schemas.CouponCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    existing = (
        db.query(models.Coupon)
        .filter(models.Coupon.code.ilike(payload.code.strip()))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    coupon = models.Coupon(
        code=payload.code.strip().upper(),
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        min_order=payload.min_order,
        active=payload.active,
        expires_at=payload.expires_at,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.put("/{coupon_id}", response_model=schemas.CouponOut)
def update_coupon(
    coupon_id: int,
    payload: schemas.CouponUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    coupon = _coupon_or_404(db, coupon_id)
    data = payload.model_dump(exclude_unset=True)

    if "code" in data and data["code"]:
        new_code = data["code"].strip().upper()
        existing = (
            db.query(models.Coupon)
            .filter(models.Coupon.code.ilike(new_code), models.Coupon.id != coupon_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")
        data["code"] = new_code

    for field, value in data.items():
        setattr(coupon, field, value)

    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}", status_code=204)
def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    coupon = _coupon_or_404(db, coupon_id)
    db.delete(coupon)
    db.commit()
    return None


@router.post("/validate", response_model=schemas.CouponValidateResult)
def validate_coupon(payload: schemas.CouponValidate, db: Session = Depends(get_db)):
    coupon = (
        db.query(models.Coupon)
        .filter(models.Coupon.code.ilike(payload.code.strip()))
        .first()
    )
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    discount = coupon_discount(coupon, payload.subtotal)
    return schemas.CouponValidateResult(
        code=coupon.code,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        discount=discount,
        total=round(payload.subtotal - discount, 2),
    )
