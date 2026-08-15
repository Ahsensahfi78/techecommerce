import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin, get_current_user, get_optional_user
from ..database import get_db

router = APIRouter(prefix="/api/returns", tags=["returns"])

RETURN_STATUSES = {"requested", "approved", "rejected", "refunded", "completed"}


def _to_out(sales_return: models.SalesReturn) -> schemas.ReturnOut:
    out = schemas.ReturnOut.model_validate(sales_return)
    out.order = (
        schemas.OrderOut.model_validate(sales_return.order)
        if sales_return.order
        else None
    )
    out.supplier = (
        schemas.SupplierOut.model_validate(sales_return.supplier)
        if sales_return.supplier
        else None
    )
    out.user_name = sales_return.user.name if sales_return.user else None
    return out


def _return_or_404(db: Session, return_id: int) -> models.SalesReturn:
    sales_return = (
        db.query(models.SalesReturn)
        .filter(models.SalesReturn.id == return_id)
        .first()
    )
    if not sales_return:
        raise HTTPException(status_code=404, detail="Return not found")
    return sales_return


def _infer_supplier(db: Session, order: models.Order) -> Optional[models.Supplier]:
    """Find a supplier from the products on the order, if one is mapped."""
    if not order or not order.items:
        return None
    product_ids = [i.product_id for i in order.items if i.product_id]
    if not product_ids:
        return None
    products = (
        db.query(models.Product)
        .filter(
            models.Product.id.in_(product_ids),
            models.Product.supplier_id.isnot(None),
        )
        .all()
    )
    for p in products:
        if p.supplier:
            return p.supplier
    return None


@router.get("", response_model=List[schemas.ReturnOut])
def list_returns(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    if status and status not in RETURN_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    query = db.query(models.SalesReturn)
    if status:
        query = query.filter(models.SalesReturn.status == status)
    returns = query.order_by(models.SalesReturn.created_at.desc()).all()
    return [_to_out(r) for r in returns]


@router.get("/mine", response_model=List[schemas.ReturnOut])
def my_returns(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    returns = (
        db.query(models.SalesReturn)
        .filter(models.SalesReturn.user_id == user.id)
        .order_by(models.SalesReturn.created_at.desc())
        .all()
    )
    return [_to_out(r) for r in returns]


@router.get("/{return_id}", response_model=schemas.ReturnOut)
def get_return(
    return_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    sales_return = _return_or_404(db, return_id)
    if not user.is_admin and sales_return.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your return")
    return _to_out(sales_return)


@router.post("", response_model=schemas.ReturnOut, status_code=201)
def create_return(
    payload: schemas.ReturnCreate,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user),
):
    order = db.query(models.Order).filter(models.Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user and not user.is_admin and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your order")

    if payload.items:
        order_item_map = {i.id: i for i in order.items}
        for item in payload.items:
            if item.order_item_id not in order_item_map:
                raise HTTPException(
                    status_code=400,
                    detail=f"Order item {item.order_item_id} is not part of order #{order.id}",
                )
            if item.quantity > order_item_map[item.order_item_id].quantity:
                raise HTTPException(
                    status_code=400,
                    detail="Return quantity exceeds ordered quantity",
                )

    sales_return = models.SalesReturn(
        return_number=f"RTN-{order.id}-{uuid.uuid4().hex[:6].upper()}",
        order_id=order.id,
        user_id=user.id if user else None,
        reason=payload.reason,
        status="requested",
        notes=payload.notes,
    )

    refund_total = 0.0
    if payload.items:
        for item in payload.items:
            order_item = order_item_map[item.order_item_id]
            price = order_item.price * item.quantity
            refund_total += price
            sales_return.items.append(
                models.ReturnItem(
                    order_item_id=order_item.id,
                    product_id=order_item.product_id,
                    product_name=order_item.product_name,
                    quantity=item.quantity,
                    price=price,
                )
            )

    # Link a supplier from the product mapping when one can be determined.
    supplier = _infer_supplier(db, order)
    sales_return.supplier_id = supplier.id if supplier else None
    sales_return.refund_amount = round(refund_total, 2)

    db.add(sales_return)
    db.commit()
    db.refresh(sales_return)
    return _to_out(sales_return)


@router.patch("/{return_id}/status", response_model=schemas.ReturnOut)
def update_return_status(
    return_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    status = payload.get("status")
    if status not in RETURN_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    sales_return = _return_or_404(db, return_id)
    sales_return.status = status
    sales_return.updated_at = datetime.utcnow()
    if "refund_amount" in payload and payload["refund_amount"] is not None:
        sales_return.refund_amount = round(float(payload["refund_amount"]), 2)
    if "supplier_id" in payload:
        sales_return.supplier_id = payload.get("supplier_id")
    if "notes" in payload and payload["notes"] is not None:
        sales_return.notes = payload["notes"]
    db.commit()
    db.refresh(sales_return)
    return _to_out(sales_return)
