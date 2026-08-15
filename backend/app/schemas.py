from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=100)


# ---------- Users ----------
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    is_admin: bool
    created_at: datetime


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=6)
    is_admin: Optional[bool] = None


# ---------- Categories ----------
class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = ""


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# ---------- Products ----------
class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = ""
    price: float = Field(gt=0)
    stock: int = Field(default=0, ge=0)
    image_url: str = ""
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    featured: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    stock: Optional[int] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    featured: Optional[bool] = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    category_name: Optional[str] = None
    supplier_name: Optional[str] = None
    avg_rating: Optional[float] = None
    review_count: int = 0


class ProductPage(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    page_size: int
    pages: int


class ProductSuggest(BaseModel):
    id: int
    name: str
    price: float
    image_url: str
    category_name: Optional[str] = None


# ---------- Reviews ----------
class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(default="", max_length=2000)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    user_id: Optional[int]
    user_name: str
    rating: int
    comment: str
    created_at: datetime


# ---------- Wishlist ----------
class WishlistAdd(BaseModel):
    product_id: int


# ---------- Coupons ----------
class CouponBase(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    discount_type: str = Field(default="percent", pattern="^(percent|fixed)$")
    discount_value: float = Field(gt=0)
    min_order: float = Field(default=0, ge=0)
    active: bool = True
    expires_at: Optional[datetime] = None


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    code: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = Field(default=None, gt=0)
    min_order: Optional[float] = Field(default=None, ge=0)
    active: Optional[bool] = None
    expires_at: Optional[datetime] = None


class CouponOut(CouponBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class CouponValidate(BaseModel):
    code: str
    subtotal: float = Field(ge=0)


class CouponValidateResult(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    discount: float
    total: float


# ---------- Upload ----------
class UploadOut(BaseModel):
    url: str


# ---------- Orders ----------
class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1)
    customer_email: EmailStr
    customer_phone: str = ""
    shipping_address: str = Field(min_length=1)
    city: str = ""
    postal_code: str = ""
    items: List[OrderItemIn] = Field(min_length=1)
    coupon_code: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: Optional[int]
    product_name: str
    price: float
    quantity: int
    image_url: str


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    shipping_address: str
    city: str
    postal_code: str
    status: str
    total: float
    discount: float = 0.0
    coupon_code: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut] = []


# ---------- Dashboard ----------
class DashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    total_products: int
    total_customers: int
    pending_orders: int
    recent_orders: List[OrderOut]
    low_stock_products: List[ProductOut]
    category_counts: List[dict]


class CategoryCount(BaseModel):
    category: str
    count: int


# ---------- Suppliers ----------
class SupplierBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    contact_name: str = ""
    email: str = ""
    phone: str = ""
    address: str = ""
    notes: str = ""


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class SupplierOut(SupplierBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    product_count: int = 0


# ---------- Sales Returns ----------
class ReturnItemIn(BaseModel):
    order_item_id: int
    quantity: int = Field(ge=1)


class ReturnCreate(BaseModel):
    order_id: int
    reason: str = ""
    items: List[ReturnItemIn] = Field(default_factory=list)
    notes: str = ""


class ReturnUpdate(BaseModel):
    status: Optional[str] = None
    refund_amount: Optional[float] = Field(default=None, ge=0)
    supplier_id: Optional[int] = None
    notes: Optional[str] = None


class ReturnItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    return_id: int
    order_item_id: Optional[int]
    product_id: Optional[int]
    product_name: str
    quantity: int
    price: float


class ReturnOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    return_number: str
    order_id: int
    user_id: Optional[int]
    reason: str
    status: str
    refund_amount: float
    supplier_id: Optional[int]
    notes: str
    created_at: datetime
    updated_at: datetime
    items: List[ReturnItemOut] = []
    order: Optional[OrderOut] = None
    supplier: Optional[SupplierOut] = None
    user_name: Optional[str] = None


# ---------- Enquiries ----------
class EnquiryCreate(BaseModel):
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)
    category: str = "general"
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    supplier_id: Optional[int] = None


class EnquiryUpdate(BaseModel):
    status: Optional[str] = None
    supplier_id: Optional[int] = None


class EnquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    subject: str
    message: str
    category: str
    reference_type: Optional[str]
    reference_id: Optional[int]
    supplier_id: Optional[int]
    status: str
    created_at: datetime
    user_name: Optional[str] = None
    supplier: Optional[SupplierOut] = None


Token.model_rebuild()
OrderOut.model_rebuild()
DashboardStats.model_rebuild()
ReturnOut.model_rebuild()
EnquiryOut.model_rebuild()
