from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("", response_model=List[schemas.ProductOut])
def get_wishlist(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    items = (
        db.query(models.WishlistItem)
        .filter(models.WishlistItem.user_id == user.id)
        .order_by(models.WishlistItem.created_at.desc())
        .all()
    )
    return [item.product for item in items]


@router.post("", response_model=schemas.ProductOut, status_code=201)
def add_to_wishlist(
    payload: schemas.WishlistAdd,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    product = (
        db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(models.WishlistItem)
        .filter(
            models.WishlistItem.user_id == user.id,
            models.WishlistItem.product_id == payload.product_id,
        )
        .first()
    )
    if existing:
        return product

    db.add(models.WishlistItem(user_id=user.id, product_id=payload.product_id))
    db.commit()
    return product


@router.delete("/{product_id}", status_code=204)
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    item = (
        db.query(models.WishlistItem)
        .filter(
            models.WishlistItem.user_id == user.id,
            models.WishlistItem.product_id == product_id,
        )
        .first()
    )
    if item:
        db.delete(item)
        db.commit()
    return None
