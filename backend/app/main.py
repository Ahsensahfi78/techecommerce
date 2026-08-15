import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from .database import Base, engine
from .routers import (
    auth,
    categories,
    coupons,
    dashboard,
    enquiries,
    orders,
    products,
    returns,
    reviews,
    suppliers,
    upload,
    users,
    wishlist,
)

Base.metadata.create_all(bind=engine)


def _run_lightweight_migrations() -> None:
    """Add nullable columns to existing SQLite tables without dropping data."""
    with engine.begin() as conn:
        existing = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(products)")).fetchall()
        }
        if "supplier_id" not in existing:
            conn.execute(
                text("ALTER TABLE products ADD COLUMN supplier_id INTEGER")
            )


_run_lightweight_migrations()

app = FastAPI(
    title="TechMos API",
    description="E-commerce backend with full CRUD for products, categories, orders, users, coupons, wishlist and reviews.",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(orders.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(reviews.router)
app.include_router(wishlist.router)
app.include_router(coupons.router)
app.include_router(suppliers.router)
app.include_router(returns.router)
app.include_router(enquiries.router)
app.include_router(upload.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "TechMos API"}
