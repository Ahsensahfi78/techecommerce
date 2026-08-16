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
    """Add nullable columns to existing databases without dropping data."""
    from sqlalchemy import inspect

    inspector = inspect(engine)
    columns = {col["name"] for col in inspector.get_columns("products")}
    if "supplier_id" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE products ADD COLUMN supplier_id INTEGER")
            )


_run_lightweight_migrations()


def _seed_if_empty() -> None:
    """Seed demo data on first boot so a fresh (ephemeral) database is usable."""
    from .models import Product
    from .database import SessionLocal

    with SessionLocal() as db:
        if db.query(Product).count() == 0:
            from seed import seed

            seed()


_seed_if_empty()

app = FastAPI(
    title="TechMos API",
    description="E-commerce backend with full CRUD for products, categories, orders, users, coupons, wishlist and reviews.",
    version="2.1.0",
)

cors_origins = os.getenv("CORS_ORIGINS", "*")
allow_origins = [o.strip() for o in cors_origins.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
try:
    os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
except OSError:
    # read-only serverless filesystem (e.g. Vercel): uploads endpoint stays unavailable
    pass

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
