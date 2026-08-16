import type {
  Category,
  Coupon,
  CouponResult,
  DashboardStats,
  Enquiry,
  Order,
  OrderItem,
  Product,
  ProductPage,
  ProductSuggest,
  Review,
  SalesPoint,
  SalesReturn,
  Supplier,
  User,
} from "./types";

const CATEGORIES: Category[] = [
  { id: 1, name: "Electronics", description: "Phones, laptops, audio and gadgets", created_at: "2026-01-10T08:00:00" },
  { id: 2, name: "Fashion", description: "Trendy clothing and accessories", created_at: "2026-01-10T08:00:00" },
  { id: 3, name: "Home & Kitchen", description: "Everything to make home feel great", created_at: "2026-01-10T08:00:00" },
  { id: 4, name: "Beauty", description: "Skincare, makeup and personal care", created_at: "2026-01-10T08:00:00" },
  { id: 5, name: "Sports", description: "Fitness gear and outdoor equipment", created_at: "2026-01-10T08:00:00" },
  { id: 6, name: "Books", description: "Bestsellers and new releases", created_at: "2026-01-10T08:00:00" },
];

const RAW_PRODUCTS: Array<[name: string, desc: string, price: number, stock: number, image: string, catId: number, featured: boolean]> = [
  ["Wireless Headphones", "Premium noise-cancelling over-ear headphones with 40h battery life.", 129.99, 35, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", 1, true],
  ["Smart Watch Pro", "Track fitness, heart rate and notifications on a vivid AMOLED display.", 199.0, 22, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", 1, true],
  ["Mechanical Keyboard", "Hot-swappable RGB keyboard with tactile switches for work and play.", 89.5, 18, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80", 1, false],
  ["4K Action Camera", "Capture every adventure in crisp 4K with image stabilization.", 249.99, 12, "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80", 1, false],
  ["Classic Denim Jacket", "Timeless medium-wash denim jacket with a comfortable fit.", 79.99, 40, "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80", 2, true],
  ["Premium Sneakers", "Lightweight breathable sneakers designed for all-day comfort.", 119.0, 28, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", 2, true],
  ["Leather Crossbody Bag", "Minimalist genuine-leather bag perfect for everyday carry.", 64.99, 15, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80", 2, false],
  ["Aviator Sunglasses", "Polarized UV400 aviators with a classic metal frame.", 45.0, 33, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80", 2, false],
  ["Stainless Cookware Set", "10-piece durable cookware set with induction-safe base.", 159.99, 10, "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80", 3, true],
  ["Ceramic Mug Set", "Set of 4 hand-glazed ceramic mugs in earthy tones.", 29.99, 50, "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80", 3, false],
  ["Espresso Machine", "Barista-level espresso with 15-bar pump and milk frother.", 349.0, 8, "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80", 3, false],
  ["Vitamix Blender", "High-performance blender for smoothies, soups and sauces.", 399.0, 6, "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80", 3, false],
  ["Vitamin C Serum", "Brightening serum with 20% vitamin C for radiant skin.", 24.99, 60, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80", 4, true],
  ["Silk Pillowcase", "Mulberry silk pillowcase gentle on hair and skin.", 39.0, 45, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80", 4, false],
  ["Hydrating Face Cream", "Deep moisture 24h face cream with hyaluronic acid.", 19.99, 70, "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", 4, false],
  ["Yoga Mat", "Non-slip eco-friendly yoga mat with carrying strap.", 32.0, 25, "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80", 5, true],
  ["Dumbbell Set", "Adjustable dumbbells from 2.5kg to 24kg for home gyms.", 189.0, 9, "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80", 5, false],
  ["Running Shoes", "Responsive cushioning running shoes for daily miles.", 139.0, 20, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", 5, false],
  ["The Midnight Library", "A moving bestseller about life's infinite possibilities.", 15.99, 100, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80", 6, true],
  ["Atomic Habits", "Tiny changes, remarkable results - the habit bible.", 13.5, 85, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80", 6, true],
];

const SUPPLIER_BY_CAT: Record<string, string> = {
  Electronics: "Nova Audio Works",
  Fashion: "StyleLine Apparel",
  "Home & Kitchen": "HomeCraft Living",
  Beauty: "GlowLab Beauty",
  Sports: "Endurance Sports Co.",
  Books: "BookNest Distribution",
};

const RATINGS: Record<number, { avg: number; count: number }> = {
  0: { avg: 4.7, count: 3 },
  1: { avg: 4.5, count: 2 },
  4: { avg: 4.3, count: 2 },
  5: { avg: 4.6, count: 3 },
  18: { avg: 4.8, count: 5 },
  19: { avg: 4.4, count: 2 },
};

const PRODUCTS: Product[] = RAW_PRODUCTS.map((r, i) => {
  const cat = CATEGORIES.find((c) => c.id === r[5])!;
  const rating = RATINGS[i];
  return {
    id: i + 1,
    name: r[0],
    description: r[1],
    price: r[2],
    stock: r[3],
    image_url: r[4],
    category_id: r[5],
    category_name: cat.name,
    supplier_id: cat.id,
    supplier_name: SUPPLIER_BY_CAT[cat.name] ?? null,
    featured: r[6],
    avg_rating: rating?.avg ?? null,
    review_count: rating?.count ?? 0,
    created_at: `2026-05-${String((i % 28) + 1).padStart(2, "0")}T09:00:00`,
  };
});

const SUPPLIERS: Supplier[] = [
  { id: 1, name: "Nova Audio Works", contact_name: "Hannah Brooks", email: "orders@novaaudio.example", phone: "+1 555 010 0101", address: "18 Electronics Park, Austin TX", notes: "Demo supplier for the returns & enquiries workflow.", created_at: "2026-01-10T08:00:00", product_count: 4 },
  { id: 2, name: "StyleLine Apparel", contact_name: "Marcus Lee", email: "sales@styleline.example", phone: "+1 555 010 0102", address: "402 Garment District, New York NY", notes: "Demo supplier for the returns & enquiries workflow.", created_at: "2026-01-10T08:00:00", product_count: 4 },
  { id: 3, name: "HomeCraft Living", contact_name: "Priya Nair", email: "hello@homecraft.example", phone: "+1 555 010 0103", address: "77 Harbor Ave, Portland OR", notes: "Demo supplier for the returns & enquiries workflow.", created_at: "2026-01-10T08:00:00", product_count: 4 },
  { id: 4, name: "GlowLab Beauty", contact_name: "Sofia Rossi", email: "care@glowlab.example", phone: "+1 555 010 0104", address: "21 Cosmetic Row, Miami FL", notes: "Demo supplier for the returns & enquiries workflow.", created_at: "2026-01-10T08:00:00", product_count: 3 },
  { id: 5, name: "Endurance Sports Co.", contact_name: "Tom Becker", email: "orders@endurancesports.example", phone: "+1 555 010 0105", address: "9 Fieldstone Dr, Denver CO", notes: "Demo supplier for the returns & enquiries workflow.", created_at: "2026-01-10T08:00:00", product_count: 3 },
  { id: 6, name: "BookNest Distribution", contact_name: "Amara Osei", email: "supply@booknest.example", phone: "+1 555 010 0106", address: "140 Reader Lane, Chicago IL", notes: "Demo supplier for the returns & enquiries workflow.", created_at: "2026-01-10T08:00:00", product_count: 2 },
];

const USERS: User[] = [
  { id: 1, name: "Admin", email: "admin@shopease.com", is_admin: true, created_at: "2026-01-10T08:00:00" },
  { id: 2, name: "Demo Customer", email: "demo@shopease.com", is_admin: false, created_at: "2026-01-10T08:00:00" },
];

const COUPONS: Coupon[] = [
  { id: 1, code: "WELCOME10", discount_type: "percent", discount_value: 10, min_order: 0, active: true, expires_at: null, created_at: "2026-01-10T08:00:00" },
  { id: 2, code: "SAVE20", discount_type: "percent", discount_value: 20, min_order: 100, active: true, expires_at: null, created_at: "2026-01-10T08:00:00" },
  { id: 3, code: "FLAT5", discount_type: "fixed", discount_value: 5, min_order: 50, active: true, expires_at: null, created_at: "2026-01-10T08:00:00" },
  { id: 4, code: "EXPIRED25", discount_type: "percent", discount_value: 25, min_order: 0, active: false, expires_at: "2026-01-01T00:00:00", created_at: "2026-01-10T08:00:00" },
];

const REVIEW_POOL: Array<[number, string, string]> = [
  [5, "Alice", "Absolutely love it! Works exactly as described."],
  [5, "James", "Excellent quality, arrived quickly. Highly recommend."],
  [4, "Maria", "Very good product. Minor nitpicks but overall great value."],
  [4, "David", "Solid choice, does the job well."],
  [5, "Sofia", "Best purchase I've made this year. Five stars!"],
  [4, "Omar", "Good build quality and fast delivery."],
  [5, "Elena", "My whole family loves it. Would buy again."],
  [4, "Raj", "Great product, packaging was a little damaged."],
];

const REVIEWS: Review[] = [1, 2, 5, 19].flatMap((pid, idx) =>
  [0, 2, 4].map((ri, j) => {
    const [rating, name, comment] = REVIEW_POOL[(idx * 3 + j) % REVIEW_POOL.length];
    return {
      id: idx * 10 + j + 1,
      product_id: pid,
      user_id: 2,
      user_name: name,
      rating,
      comment,
      created_at: `2026-07-${String((idx * 5 + j) % 28 + 1).padStart(2, "0")}T10:00:00`,
    };
  })
);

const SAMPLE_ORDER_ITEMS: OrderItem[] = [
  { id: 1, product_id: 1, product_name: "Wireless Headphones", price: 129.99, quantity: 1, image_url: PRODUCTS[0].image_url },
  { id: 2, product_id: 5, product_name: "Classic Denim Jacket", price: 79.99, quantity: 1, image_url: PRODUCTS[4].image_url },
  { id: 3, product_id: 13, product_name: "Vitamin C Serum", price: 24.99, quantity: 2, image_url: PRODUCTS[12].image_url },
];

const SAMPLE_ORDERS: Order[] = [
  {
    id: 1001,
    user_id: 2,
    customer_name: "Demo Customer",
    customer_email: "demo@shopease.com",
    customer_phone: "+92 300 1234567",
    shipping_address: "123 Street Road, Gulberg III",
    city: "Lahore",
    postal_code: "54660",
    status: "shipped",
    total: 259.97,
    discount: 0,
    coupon_code: null,
    created_at: "2026-08-02T09:30:00",
    items: SAMPLE_ORDER_ITEMS,
  },
  {
    id: 1000,
    user_id: 2,
    customer_name: "Demo Customer",
    customer_email: "demo@shopease.com",
    customer_phone: "+92 300 1234567",
    shipping_address: "123 Street Road, Gulberg III",
    city: "Lahore",
    postal_code: "54660",
    status: "delivered",
    total: 169.99,
    discount: 13.0,
    coupon_code: "WELCOME10",
    created_at: "2026-07-15T14:00:00",
    items: [
      { id: 4, product_id: 2, product_name: "Smart Watch Pro", price: 199.0, quantity: 1, image_url: PRODUCTS[1].image_url },
    ],
  },
];

const WISH_KEY = "shopease_wishlist_demo";
let demoWarned = false;

function readWishlist(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(WISH_KEY) ?? "[]") as number[];
  } catch {
    return [];
  }
}

function writeWishlist(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WISH_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function fail(status: number, message: string): never {
  throw Object.assign(new Error(message), { status });
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function listProducts(query: URLSearchParams): ProductPage {
  let list = [...PRODUCTS];

  const search = (query.get("search") ?? "").trim().toLowerCase();
  if (search) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
    );
  }
  if (query.get("featured") === "true") list = list.filter((p) => p.featured);

  const category = query.get("category");
  if (category) list = list.filter((p) => String(p.category_id) === category);

  const minPrice = Number(query.get("min_price") ?? "0");
  if (minPrice > 0) list = list.filter((p) => p.price >= minPrice);
  const maxPrice = Number(query.get("max_price") ?? "0");
  if (maxPrice > 0) list = list.filter((p) => p.price <= maxPrice);

  const sort = query.get("sort") ?? "";
  switch (sort) {
    case "newest":
      list.sort((a, b) => b.id - a.id);
      break;
    case "price_asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
      break;
    default:
      list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const page = Math.max(1, Number(query.get("page") ?? "1"));
  const page_size = Math.max(1, Number(query.get("page_size") ?? "12"));
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / page_size));
  const start = (page - 1) * page_size;

  return { items: list.slice(start, start + page_size), total, page, page_size, pages };
}

function suggestProducts(q: string): ProductSuggest[] {
  const term = q.toLowerCase();
  return PRODUCTS.filter(
    (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
  )
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      category_name: p.category_name,
    }));
}

function dashboardStats(): DashboardStats {
  return {
    total_revenue: round2(SAMPLE_ORDERS.reduce((s, o) => s + o.total, 0)),
    total_orders: SAMPLE_ORDERS.length,
    total_products: PRODUCTS.length,
    total_customers: USERS.filter((u) => !u.is_admin).length,
    pending_orders: SAMPLE_ORDERS.filter((o) => o.status === "pending").length,
    recent_orders: SAMPLE_ORDERS,
    low_stock_products: PRODUCTS.filter((p) => p.stock <= 5).slice(0, 5),
    category_counts: CATEGORIES.map((c) => ({
      category: c.name,
      count: PRODUCTS.filter((p) => p.category_id === c.id).length,
    })),
  };
}

function salesOverTime(): SalesPoint[] {
  const today = new Date();
  const points: SalesPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    points.push({
      date: d.toISOString().slice(0, 10),
      revenue: Math.round(400 + Math.abs(Math.sin((i + 3) * 1.7)) * 3200 * 100) / 100,
      orders: 1 + (i % 4),
    });
  }
  return points;
}

function login(body: { email?: string; password?: string }) {
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (email === "admin@shopease.com" && password === "admin123") {
    return { access_token: "demo-admin-token", user: USERS[0] };
  }
  if (email === "demo@shopease.com" && password === "demo123") {
    return { access_token: "demo-user-token", user: USERS[1] };
  }
  fail(401, "Incorrect email or password.");
}

function register(body: { name?: string; email?: string }) {
  const user: User = {
    id: 999,
    name: body.name ?? "New Customer",
    email: (body.email ?? "").toLowerCase(),
    is_admin: false,
    created_at: new Date().toISOString(),
  };
  return { access_token: "demo-user-token", user };
}

function validateCoupon(body: { code?: string; subtotal?: number }): CouponResult {
  const code = (body.code ?? "").trim().toUpperCase();
  const subtotal = Number(body.subtotal ?? 0);
  const coupon = COUPONS.find((c) => c.code === code && c.active);
  if (!coupon) fail(404, "Invalid or expired coupon code.");
  if (subtotal < coupon!.min_order) {
    fail(400, `This coupon requires a minimum order of Rs ${coupon!.min_order}.`);
  }
  const discount =
    coupon!.discount_type === "percent"
      ? (subtotal * coupon!.discount_value) / 100
      : coupon!.discount_value;
  return {
    code: coupon!.code,
    discount_type: coupon!.discount_type,
    discount_value: coupon!.discount_value,
    discount: round2(discount),
    total: round2(subtotal - discount),
  };
}

function findOrder(id: number): Order {
  return SAMPLE_ORDERS.find((o) => o.id === id) ?? { ...SAMPLE_ORDERS[0], id };
}

function wishlistProducts(): Product[] {
  const ids = readWishlist();
  return PRODUCTS.filter((p) => ids.includes(p.id));
}

function warnOnce() {
  if (demoWarned || typeof window === "undefined") return;
  demoWarned = true;
  console.info("[demo] API unreachable — serving built-in sample data");
}

export async function handleMockApi<T>(
  path: string,
  method: string,
  body?: unknown
): Promise<T> {
  warnOnce();
  const [apiPathRaw, queryStr] = path.split("?");
  const apiPath = apiPathRaw ?? path;
  const query = new URLSearchParams(queryStr ?? "");

  if (method === "GET") {
    if (apiPath === "/api/products") return listProducts(query) as T;
    if (apiPath === "/api/products/suggest")
      return suggestProducts(query.get("q") ?? "") as T;
    if (apiPath === "/api/categories") return CATEGORIES as T;
    if (apiPath === "/api/wishlist") return wishlistProducts() as T;
    if (apiPath === "/api/orders/mine") return SAMPLE_ORDERS as T;
    if (apiPath === "/api/orders") return SAMPLE_ORDERS as T;
    if (apiPath === "/api/users") return USERS as T;
    if (apiPath === "/api/coupons") return COUPONS as T;
    if (apiPath === "/api/suppliers") return SUPPLIERS as T;
    if (apiPath === "/api/dashboard/stats") return dashboardStats() as T;
    if (apiPath === "/api/orders/stats/sales-over-time") return salesOverTime() as T;
    if (apiPath === "/api/returns") return [] as SalesReturn[] as T;
    if (apiPath === "/api/enquiries") return [] as Enquiry[] as T;

    const prodMatch = apiPath.match(/^\/api\/products\/(\d+)$/);
    if (prodMatch) {
      const product = PRODUCTS.find((p) => p.id === Number(prodMatch[1]));
      if (!product) fail(404, "Product not found.");
      return product as T;
    }

    const revMatch = apiPath.match(/^\/api\/products\/(\d+)\/reviews$/);
    if (revMatch) {
      return REVIEWS.filter((r) => r.product_id === Number(revMatch[1])) as T;
    }

    const orderMatch = apiPath.match(/^\/api\/orders\/(\d+)$/);
    if (orderMatch) return findOrder(Number(orderMatch[1])) as T;

    const wishMatch = apiPath.match(/^\/api\/wishlist\/(\d+)$/);
    if (wishMatch) return true as T;

    return [] as T;
  }

  if (method === "POST") {
    if (apiPath === "/api/auth/login")
      return login((body ?? {}) as { email?: string; password?: string }) as T;
    if (apiPath === "/api/auth/register")
      return register((body ?? {}) as { name?: string; email?: string }) as T;
    if (apiPath === "/api/coupons/validate")
      return validateCoupon((body ?? {}) as { code?: string; subtotal?: number }) as T;
    if (apiPath === "/api/orders") return { id: 1001 } as T;
    if (apiPath === "/api/wishlist") {
      const productId = (body as { product_id?: number } | undefined)?.product_id;
      if (productId) {
        const ids = readWishlist();
        if (!ids.includes(productId)) writeWishlist([...ids, productId]);
      }
      return {} as T;
    }
    const revPost = apiPath.match(/^\/api\/products\/(\d+)\/reviews$/);
    if (revPost) return { id: 999 } as T;
    return {} as T;
  }

  if (method === "PUT" || method === "PATCH") {
    if (apiPath === "/api/orders/status" || apiPath.endsWith("/status")) return {} as T;
    return {} as T;
  }

  if (method === "DELETE") {
    const wishDelete = apiPath.match(/^\/api\/wishlist\/(\d+)$/);
    if (wishDelete) {
      const id = Number(wishDelete[1]);
      writeWishlist(readWishlist().filter((x) => x !== id));
    }
    return undefined as T;
  }

  return {} as T;
}
