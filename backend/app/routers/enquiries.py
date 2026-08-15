from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin, get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/enquiries", tags=["enquiries"])

ENQUIRY_STATUSES = {"open", "answered", "closed"}
ENQUIRY_CATEGORIES = {"general", "order", "return", "supplier"}


def _to_out(enquiry: models.Enquiry) -> schemas.EnquiryOut:
    out = schemas.EnquiryOut.model_validate(enquiry)
    out.user_name = enquiry.user.name if enquiry.user else None
    out.supplier = (
        schemas.SupplierOut.model_validate(enquiry.supplier)
        if enquiry.supplier
        else None
    )
    return out


def _enquiry_or_404(db: Session, enquiry_id: int) -> models.Enquiry:
    enquiry = db.query(models.Enquiry).filter(models.Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return enquiry


@router.get("", response_model=List[schemas.EnquiryOut])
def list_enquiries(
    status: Optional[str] = None,
    supplier_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    if status and status not in ENQUIRY_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    query = db.query(models.Enquiry)
    if status:
        query = query.filter(models.Enquiry.status == status)
    if supplier_id is not None:
        query = query.filter(models.Enquiry.supplier_id == supplier_id)
    if category:
        query = query.filter(models.Enquiry.category == category)
    enquiries = query.order_by(models.Enquiry.created_at.desc()).all()
    return [_to_out(e) for e in enquiries]


@router.get("/mine", response_model=List[schemas.EnquiryOut])
def my_enquiries(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    enquiries = (
        db.query(models.Enquiry)
        .filter(models.Enquiry.user_id == user.id)
        .order_by(models.Enquiry.created_at.desc())
        .all()
    )
    return [_to_out(e) for e in enquiries]


@router.get("/{enquiry_id}", response_model=schemas.EnquiryOut)
def get_enquiry(
    enquiry_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    enquiry = _enquiry_or_404(db, enquiry_id)
    if not user.is_admin and enquiry.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your enquiry")
    return _to_out(enquiry)


@router.post("", response_model=schemas.EnquiryOut, status_code=201)
def create_enquiry(
    payload: schemas.EnquiryCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if payload.category not in ENQUIRY_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    supplier = None
    if payload.supplier_id is not None:
        supplier = (
            db.query(models.Supplier)
            .filter(models.Supplier.id == payload.supplier_id)
            .first()
        )
        if not supplier:
            raise HTTPException(status_code=400, detail="Supplier not found")

    enquiry = models.Enquiry(
        user_id=user.id,
        subject=payload.subject,
        message=payload.message,
        category=payload.category,
        reference_type=payload.reference_type,
        reference_id=payload.reference_id,
        supplier_id=payload.supplier_id,
        status="open",
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return _to_out(enquiry)


@router.patch("/{enquiry_id}/status", response_model=schemas.EnquiryOut)
def update_enquiry_status(
    enquiry_id: int,
    payload: schemas.EnquiryUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    enquiry = _enquiry_or_404(db, enquiry_id)
    if payload.status is not None:
        if payload.status not in ENQUIRY_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid status")
        enquiry.status = payload.status
    if payload.supplier_id is not None:
        supplier = (
            db.query(models.Supplier)
            .filter(models.Supplier.id == payload.supplier_id)
            .first()
        )
        if not supplier:
            raise HTTPException(status_code=400, detail="Supplier not found")
        enquiry.supplier_id = payload.supplier_id
    db.commit()
    db.refresh(enquiry)
    return _to_out(enquiry)
