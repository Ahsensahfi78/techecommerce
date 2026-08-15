from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])


def _supplier_or_404(db: Session, supplier_id: int) -> models.Supplier:
    supplier = (
        db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    )
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


def _to_out(supplier: models.Supplier) -> schemas.SupplierOut:
    out = schemas.SupplierOut.model_validate(supplier)
    out.product_count = len(supplier.products) if supplier.products else 0
    return out


@router.get("", response_model=List[schemas.SupplierOut])
def list_suppliers(
    search: str | None = None,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    query = db.query(models.Supplier)
    if search:
        query = query.filter(models.Supplier.name.ilike(f"%{search.strip()}%"))
    suppliers = query.order_by(models.Supplier.name.asc()).all()
    return [_to_out(s) for s in suppliers]


@router.get("/{supplier_id}", response_model=schemas.SupplierOut)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    return _to_out(_supplier_or_404(db, supplier_id))


@router.post("", response_model=schemas.SupplierOut, status_code=201)
def create_supplier(
    payload: schemas.SupplierCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    existing = (
        db.query(models.Supplier)
        .filter(models.Supplier.name.ilike(payload.name.strip()))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="A supplier with that name already exists")

    supplier = models.Supplier(**payload.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return _to_out(supplier)


@router.put("/{supplier_id}", response_model=schemas.SupplierOut)
def update_supplier(
    supplier_id: int,
    payload: schemas.SupplierUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    supplier = _supplier_or_404(db, supplier_id)
    data = payload.model_dump(exclude_unset=True)

    if "name" in data:
        dup = (
            db.query(models.Supplier)
            .filter(
                models.Supplier.name.ilike(data["name"].strip()),
                models.Supplier.id != supplier_id,
            )
            .first()
        )
        if dup:
            raise HTTPException(status_code=400, detail="A supplier with that name already exists")

    for field, value in data.items():
        setattr(supplier, field, value)

    db.commit()
    db.refresh(supplier)
    return _to_out(supplier)


@router.delete("/{supplier_id}", status_code=204)
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    supplier = _supplier_or_404(db, supplier_id)
    db.delete(supplier)
    db.commit()
    return None
