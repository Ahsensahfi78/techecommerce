export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number | null;
  category_name: string | null;
  supplier_id: number | null;
  supplier_name: string | null;
  featured: boolean;
  avg_rating: number | null;
  review_count: number;
  created_at: string;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ProductSuggest {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_name: string | null;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number | null;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface CouponResult {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  discount: number;
  total: number;
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface Order {
  id: number;
  user_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  status: string;
  total: number;
  discount: number;
  coupon_code: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  pending_orders: number;
  recent_orders: Order[];
  low_stock_products: Product[];
  category_counts: { category: string; count: number }[];
}

export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  quantity: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  created_at: string;
  product_count: number;
}

export interface ReturnItem {
  id: number;
  return_id: number;
  order_item_id: number | null;
  product_id: number | null;
  product_name: string;
  quantity: number;
  price: number;
}

export type ReturnStatus = "requested" | "approved" | "rejected" | "refunded" | "completed";

export interface SalesReturn {
  id: number;
  return_number: string;
  order_id: number;
  user_id: number | null;
  reason: string;
  status: ReturnStatus;
  refund_amount: number;
  supplier_id: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
  items: ReturnItem[];
  order: Order | null;
  supplier: Supplier | null;
  user_name: string | null;
}

export type EnquiryCategory = "general" | "order" | "return" | "supplier";
export type EnquiryStatus = "open" | "answered" | "closed";

export interface Enquiry {
  id: number;
  user_id: number | null;
  subject: string;
  message: string;
  category: EnquiryCategory;
  reference_type: string | null;
  reference_id: number | null;
  supplier_id: number | null;
  status: EnquiryStatus;
  created_at: string;
  user_name: string | null;
  supplier: Supplier | null;
}
