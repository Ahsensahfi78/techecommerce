from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin, get_current_user
from ..database import get_db

router = APIRouter(tags=["reviews"])


@router.get("/api/products/{product_id}/reviews", response_model=List[schemas.ReviewOut])
def product_reviews(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return (
        db.query(models.Review)
        .filter(models.Review.product_id == product_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )


@router.post(
    "/api/products/{product_id}/reviews",
    response_model=schemas.ReviewOut,
    status_code=201,
)
def create_review(
    product_id: int,
    payload: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # One review per user per product — updates it instead of duplicating.
    existing = (
        db.query(models.Review)
        .filter(
            models.Review.product_id == product_id,
            models.Review.user_id == user.id,
        )
        .first()
    )
    if existing:
        existing.rating = payload.rating
        existing.comment = payload.comment
        db.commit()
        db.refresh(existing)
        return existing

    review = models.Review(
        product_id=product_id,
        user_id=user.id,
        user_name=user.name,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.delete("/api/reviews/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if not user.is_admin and review.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")
    db.delete(review)
    db.commit()
    return None
