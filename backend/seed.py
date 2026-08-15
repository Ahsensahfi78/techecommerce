"""Seed the database with an admin user, demo categories, products, coupons, reviews and a sample order."""

import os
import random
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, SessionLocal, engine
from app.models import (
    Category,
    Coupon,
    Order,
    OrderItem,
    Product,
    Review,
    Supplier,
    User,
    WishlistItem,
)
from app.auth import hash_password

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()

    # Admin + demo customer
    if db.query(User).filter(User.email == "admin@shopease.com").first() is None:
        db.add(
            User(
                name="Admin",
                email="admin@shopease.com",
                hashed_password=hash_password("admin123"),
                is_admin=True,
            )
        )
        print("Created admin user -> admin@shopease.com / admin123")

    if db.query(User).filter(User.email == "demo@shopease.com").first() is None:
        db.add(
            User(
                name="Demo Customer",
                email="demo@shopease.com",
                hashed_password=hash_password("demo123"),
                is_admin=False,
            )
        )

    # Categories
    categories_data = [
        ("Electronics", "Phones, laptops, audio and gadgets"),
        ("Fashion", "Trendy clothing and accessories"),
        ("Home & Kitchen", "Everything to make home feel great"),
        ("Beauty", "Skincare, makeup and personal care"),
        ("Sports", "Fitness gear and outdoor equipment"),
        ("Books", "Bestsellers and new releases"),
    ]
    categories = {}
    for name, desc in categories_data:
        existing = db.query(Category).filter(Category.name == name).first()
        if existing is None:
            cat = Category(name=name, description=desc)
            db.add(cat)
            db.flush()
            categories[name] = cat.id
        else:
            categories[name] = existing.id

    # Suppliers (used for returns/enquiries workflows)
    suppliers_data = [
        ("Nova Audio Works", "Hannah Brooks", "orders@novaaudio.example", "+1 555 010 0101", "18 Electronics Park, Austin TX"),
        ("StyleLine Apparel", "Marcus Lee", "sales@styleline.example", "+1 555 010 0102", "402 Garment District, New York NY"),
        ("HomeCraft Living", "Priya Nair", "hello@homecraft.example", "+1 555 010 0103", "77 Harbor Ave, Portland OR"),
        ("GlowLab Beauty", "Sofia Rossi", "care@glowlabb.example", "+1 555 010 0104", "21 Cosmetic Row, Miami FL"),
        ("Endurance Sports Co.", "Tom Becker", "orders@endurancesports.example", "+1 555 010 0105", "9 Fieldstone Dr, Denver CO"),
        ("BookNest Distribution", "Amara Osei", "supply@booknest.example", "+1 555 010 0106", "140 Reader Lane, Chicago IL"),
    ]
    suppliers = {}
    for s_name, s_contact, s_email, s_phone, s_addr in suppliers_data:
        existing = db.query(Supplier).filter(Supplier.name == s_name).first()
        if existing is None:
            supplier = Supplier(
                name=s_name,
                contact_name=s_contact,
                email=s_email,
                phone=s_phone,
                address=s_addr,
                notes="Demo supplier for the returns & enquiries workflow.",
            )
            db.add(supplier)
            db.flush()
            suppliers[s_name] = supplier.id
        else:
            suppliers[s_name] = existing.id

    # Products
    products_data = [        ("Wireless Headphones", "Premium noise-cancelling over-ear headphones with 40h battery life.", 129.99, 35, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", "Electronics", True),
        ("Smart Watch Pro", "Track fitness, heart rate and notifications on a vivid AMOLED display.", 199.00, 22, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", "Electronics", True),
        ("Mechanical Keyboard", "Hot-swappable RGB keyboard with tactile switches for work and play.", 89.50, 18, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80", "Electronics", False),
        ("4K Action Camera", "Capture every adventure in crisp 4K with image stabilization.", 249.99, 12, "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80", "Electronics", False),
        ("Classic Denim Jacket", "Timeless medium-wash denim jacket with a comfortable fit.", 79.99, 40, "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80", "Fashion", True),
        ("Premium Sneakers", "Lightweight breathable sneakers designed for all-day comfort.", 119.00, 28, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", "Fashion", True),
        ("Leather Crossbody Bag", "Minimalist genuine-leather bag perfect for everyday carry.", 64.99, 15, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80", "Fashion", False),
        ("Aviator Sunglasses", "Polarized UV400 aviators with a classic metal frame.", 45.00, 33, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80", "Fashion", False),
        ("Stainless Cookware Set", "10-piece durable cookware set with induction-safe base.", 159.99, 10, "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80", "Home & Kitchen", True),
        ("Ceramic Mug Set", "Set of 4 hand-glazed ceramic mugs in earthy tones.", 29.99, 50, "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80", "Home & Kitchen", False),
        ("Espresso Machine", "Barista-level espresso with 15-bar pump and milk frother.", 349.00, 8, "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80", "Home & Kitchen", False),
        ("Vitamix Blender", "High-performance blender for smoothies, soups and sauces.", 399.00, 6, "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80", "Home & Kitchen", False),
        ("Vitamin C Serum", "Brightening serum with 20% vitamin C for radiant skin.", 24.99, 60, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80", "Beauty", True),
        ("Silk Pillowcase", "Mulberry silk pillowcase gentle on hair and skin.", 39.00, 45, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80", "Beauty", False),
        ("Hydrating Face Cream", "Deep moisture 24h face cream with hyaluronic acid.", 19.99, 70, "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", "Beauty", False),
        ("Yoga Mat", "Non-slip eco-friendly yoga mat with carrying strap.", 32.00, 25, "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80", "Sports", True),
        ("Dumbbell Set", "Adjustable dumbbells from 2.5kg to 24kg for home gyms.", 189.00, 9, "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80", "Sports", False),
        ("Running Shoes", "Responsive cushioning running shoes for daily miles.", 139.00, 20, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", "Sports", False),
        ("The Midnight Library", "A moving bestseller about life's infinite possibilities.", 15.99, 100, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80", "Books", True),
        ("Atomic Habits", "Tiny changes, remarkable results - the habit bible.", 13.50, 85, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80", "Books", True),
    ]

    cat_to_supplier = {
        "Electronics": "Nova Audio Works",
        "Fashion": "StyleLine Apparel",
        "Home & Kitchen": "HomeCraft Living",
        "Beauty": "GlowLab Beauty",
        "Sports": "Endurance Sports Co.",
        "Books": "BookNest Distribution",
    }

    for (
        name,
        desc,
        price,
        stock,
        image,
        cat_name,
        featured,
    ) in products_data:
        if (
            db.query(Product).filter(Product.name == name).first() is None
        ):
            db.add(
                Product(
                    name=name,
                    description=desc,
                    price=price,
                    stock=stock,
                    image_url=image,
                    category_id=categories[cat_name],
                    supplier_id=suppliers.get(cat_to_supplier.get(cat_name, ""), None),
                    featured=featured,
                )
            )
            print(f"Added product: {name}")

    db.commit()

    # Back-fill supplier mapping on products created before suppliers existed.
    for cat_name, supplier_name in cat_to_supplier.items():
        supplier_id = suppliers.get(supplier_name)
        if supplier_id is None:
            continue
        products = (
            db.query(Product)
            .filter(
                Product.category_id == categories[cat_name],
                Product.supplier_id.is_(None),
            )
            .all()
        )
        for product in products:
            product.supplier_id = supplier_id
    db.commit()

    # Reviews for popular products
    if db.query(Review).count() == 0:
        review_pool = [
            (5, "Absolutely love it! Works exactly as described."),
            (5, "Excellent quality, arrived quickly. Highly recommend."),
            (4, "Very good product. Minor nitpicks but overall great value."),
            (4, "Solid choice, does the job well."),
            (3, "Decent but I expected a bit more for the price."),
            (5, "Best purchase I've made this year. Five stars!"),
            (4, "Good build quality and fast delivery."),
            (5, "My whole family loves it. Would buy again."),
            (2, "Did not meet my expectations unfortunately."),
            (4, "Great product, packaging was a little damaged."),
        ]
        names = ["Alice", "James", "Maria", "David", "Sofia", "Omar", "Elena", "Raj", "Nina", "Tom"]
        product_ids = [p.id for p in db.query(Product).limit(8).all()]
        added = 0
        for idx, pid in enumerate(product_ids):
            for _ in range(random.randint(2, 4)):
                rating, comment = random.choice(review_pool)
                db.add(
                    Review(
                        product_id=pid,
                        user_name=random.choice(names),
                        rating=rating,
                        comment=comment,
                    )
                )
                added += 1
        print(f"Added {added} sample reviews.")

    # Coupons
    if db.query(Coupon).count() == 0:
        db.add_all(
            [
                Coupon(
                    code="WELCOME10",
                    discount_type="percent",
                    discount_value=10,
                    min_order=0,
                    active=True,
                ),
                Coupon(
                    code="SAVE20",
                    discount_type="percent",
                    discount_value=20,
                    min_order=100,
                    active=True,
                ),
                Coupon(
                    code="FLAT5",
                    discount_type="fixed",
                    discount_value=5,
                    min_order=50,
                    active=True,
                ),
                Coupon(
                    code="EXPIRED25",
                    discount_type="percent",
                    discount_value=25,
                    min_order=0,
                    active=True,
                    expires_at=datetime.utcnow() - timedelta(days=1),
                ),
            ]
        )
        print("Added coupons: WELCOME10, SAVE20, FLAT5, EXPIRED25")

    db.commit()

    # Wishlist item for the demo customer
    demo_user = db.query(User).filter(User.email == "demo@shopease.com").first()
    if demo_user and db.query(WishlistItem).count() == 0:
        first = db.query(Product).first()
        if first:
            db.add(WishlistItem(user_id=demo_user.id, product_id=first.id))
            db.commit()
            print("Added a wishlist item for the demo user.")

    # A sample order so the dashboard has data
    if db.query(Order).count() == 0:
        products = db.query(Product).all()
        sample = random.sample(products, k=min(3, len(products)))
        items = [
            OrderItem(
                product_id=p.id,
                product_name=p.name,
                price=p.price,
                quantity=random.randint(1, 3),
                image_url=p.image_url,
            )
            for p in sample
        ]
        subtotal = round(sum(i.price * i.quantity for i in items), 2)
        discount = round(subtotal * 0.10, 2)
        order = Order(
            customer_name="Demo Customer",
            customer_email="demo@shopease.com",
            customer_phone="555-0100",
            shipping_address="123 Market Street",
            city="Springfield",
            postal_code="12345",
            status="pending",
            total=round(subtotal - discount, 2),
            discount=discount,
            coupon_code="WELCOME10",
            items=items,
        )
        db.add(order)
        db.commit()
        print("Added a sample order for the dashboard.")

    db.close()
    print("\nSeeding complete. Start the API with:  uvicorn app.main:app --reload --port 8000")


if __name__ == "__main__":
    seed()
