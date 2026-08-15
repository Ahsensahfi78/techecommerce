from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(prefix="/api/categories", tags=["categories"])


def _category_or_404(db: Session, category_id: int) -> models.Category:
    category = (
        db.query(models.Category).filter(models.Category.id == category_id).first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get("", response_model=List[schemas.CategoryOut])
def list_categories(
    search: Optional[str] = None, db: Session = Depends(get_db)
):
    query = db.query(models.Category)
    if search:
        query = query.filter(
            models.Category.name.ilike(f"%{search}%")
            | models.Category.description.ilike(f"%{search}%")
        )
    return query.order_by(models.Category.name).all()


@router.get("/{category_id}", response_model=schemas.CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    return _category_or_404(db, category_id)


@router.post("", response_model=schemas.CategoryOut, status_code=201)
def create_category(
    payload: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    existing = (
        db.query(models.Category)
        .filter(func.lower(models.Category.name) == payload.name.lower())
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    category = models.Category(name=payload.name, description=payload.description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: int,
    payload: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    category = _category_or_404(db, category_id)
    data = payload.model_dump(exclude_unset=True)

    if "name" in data and data["name"].lower() != category.name.lower():
        existing = (
            db.query(models.Category)
            .filter(
                func.lower(models.Category.name) == data["name"].lower(),
                models.Category.id != category_id,
            )
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Category already exists")

    for field, value in data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    category = _category_or_404(db, category_id)
    product_count = (
        db.query(models.Product)
        .filter(models.Product.category_id == category_id)
        .count()
    )
    if product_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category: it has {product_count} product(s). Move or delete them first.",
        )
    db.delete(category)
    db.commit()
    return None
