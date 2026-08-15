from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(prefix="/api/products", tags=["products"])


def _product_or_404(db: Session, product_id: int) -> models.Product:
    product = (
        db.query(models.Product)
        .options(selectinload(models.Product.reviews))
        .filter(models.Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def _to_out(product: models.Product) -> schemas.ProductOut:
    out = schemas.ProductOut.model_validate(product)
    out.category_name = product.category.name if product.category else None
    out.supplier_name = product.supplier.name if product.supplier else None
    if product.reviews:
        ratings = [r.rating for r in product.reviews]
        out.review_count = len(ratings)
        out.avg_rating = round(sum(ratings) / len(ratings), 1)
    return out


def _require_valid_supplier(db: Session, supplier_id: Optional[int]):
    if supplier_id is not None:
        supplier = (
            db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
        )
        if not supplier:
            raise HTTPException(status_code=400, detail="Invalid supplier")


@router.get("", response_model=schemas.ProductPage)
def list_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Product).options(selectinload(models.Product.reviews))

    if category_id is not None:
        query = query.filter(models.Product.category_id == category_id)
    if search:
        query = query.filter(
            models.Product.name.ilike(f"%{search}%")
            | models.Product.description.ilike(f"%{search}%")
        )
    if featured is not None:
        query = query.filter(models.Product.featured == featured)
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)

    if sort == "price_asc":
        query = query.order_by(models.Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(models.Product.price.desc())
    elif sort == "newest":
        query = query.order_by(models.Product.created_at.desc())
    elif sort == "rating":
        query = (
            query.outerjoin(models.Product.reviews)
            .group_by(models.Product.id)
            .order_by(models.Product.reviews.rating.desc())
        )
    else:
        query = query.order_by(models.Product.name.asc())

    total = query.count()
    pages = max(1, (total + page_size - 1) // page_size)
    page = min(page, pages)

    items = (
        query.offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return schemas.ProductPage(
        items=[_to_out(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/suggest", response_model=List[schemas.ProductSuggest])
def suggest_products(
    q: str = Query(default="", max_length=100),
    limit: int = Query(default=8, ge=1, le=20),
    db: Session = Depends(get_db),
):
    query = db.query(models.Product)
    if q.strip():
        query = query.filter(
            models.Product.name.ilike(f"%{q.strip()}%")
        )
    results = query.order_by(models.Product.name.asc()).limit(limit).all()
    return [
        schemas.ProductSuggest(
            id=p.id,
            name=p.name,
            price=p.price,
            image_url=p.image_url,
            category_name=p.category.name if p.category else None,
        )
        for p in results
    ]


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return _to_out(_product_or_404(db, product_id))


@router.post("", response_model=schemas.ProductOut, status_code=201)
def create_product(
    payload: schemas.ProductCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    if payload.category_id is not None:
        category = (
            db.query(models.Category)
            .filter(models.Category.id == payload.category_id)
            .first()
        )
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category")

    _require_valid_supplier(db, payload.supplier_id)

    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return _to_out(product)


@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    payload: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    product = _product_or_404(db, product_id)
    data = payload.model_dump(exclude_unset=True)

    if "category_id" in data and data["category_id"] is not None:
        category = (
            db.query(models.Category)
            .filter(models.Category.id == data["category_id"])
            .first()
        )
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category")

    if "supplier_id" in data:
        _require_valid_supplier(db, data["supplier_id"])

    for field, value in data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return _to_out(product)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    product = _product_or_404(db, product_id)
    db.delete(product)
    db.commit()
    return None
