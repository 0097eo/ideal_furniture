from faker import Faker
import random
from cloudinary.utils import cloudinary_url
from cloudinary.uploader import upload
from config import app, db
from sqlalchemy.exc import IntegrityError

from models import Admin, Shopper, Product, Category, Order, OrderItem, Cart, CartItem, Review, ProductAnalytics, OrderAnalytics, SearchLog

SAMPLE_IMAGE_IDS = [
    "https://plus.unsplash.com/premium_photo-1688125414593-391cf90f3103?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZnVybml0dXJlfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnVybml0dXJlfGVufDB8fDB8fHww",
    "https://plus.unsplash.com/premium_photo-1673548917423-073963e7afc9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZnVybml0dXJlfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZnVybml0dXJlfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZ1cm5pdHVyZXxlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1506898667547-42e22a46e125?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGZ1cm5pdHVyZXxlbnwwfHwwfHx8MA%3D%3D",
    "https://plus.unsplash.com/premium_photo-1689609950057-8d01c2542fd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmVkc3xlbnwwfHwwfHx8MA%3D%3D",
    "https://plus.unsplash.com/premium_photo-1675745329401-ed4b9b73be6a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YmVkc3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1658595149174-ff76486ec800?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJlZHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1657524520861-0b2690efc2b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dHYlMjBzdGFuZHxlbnwwfHwwfHx8MA%3D%3D"
]

SAMPLE_PRODUCT_NAMES = [
    "Leather Sofa", "Wooden Coffee Table", "Glass Dining Table",
    "Metal Bookshelf", "Plastic Storage Cabinet", "Upholstered Armchair",
    "Modern Bed Frame", "Memory Foam Mattress", "Vintage Dresser",
    "Rustic TV Stand", "Contemporary Office Chair", "Ergonomic Desk",
    "Wicker Outdoor Sofa", "Teak Garden Bench", "Industrial Metal Table",
    "Scandinavian Wooden Chair", "Velvet Accent Chair", "Minimalist Coffee Table",
    "Baroque Mirror", "Art Deco Lamp", "Mid-Century Modern Sofa",
    "French Provincial Bed", "Shabby Chic Dresser", "Tropical Rattan Armchair"
]

fake = Faker()

def generate_image_url():
    sample_id = random.choice(SAMPLE_IMAGE_IDS)
    result = upload(sample_id)
    url, _ = cloudinary_url(result['public_id'], width=300, height=300, crop="fill")
    return url

def seed_database():
    with app.app_context():
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()

        print("Creating admin...")
        admin_email = 'admin@example.com'
        if not Admin.query.filter_by(email=admin_email).first():
            admin = Admin(username='admin', email=admin_email, password='adminpassword')
            db.session.add(admin)
        
        # Track unique emails 
        unique_emails = set()
        print("Creating unique shoppers...")
        shoppers = []
        for _ in range(10):
            while True:
                try:
                    username = fake.unique.user_name()
                    email = fake.unique.email()

                    # Ensure the email is unique within the context
                    if email in unique_emails:
                        continue
                    
                    shopper = Shopper(
                        username=username,
                        email=email,
                        password='password',
                        shipping_address=fake.address()
                    )
                    unique_emails.add(email)  
                    shoppers.append(shopper)
                    db.session.add(shopper)
                    db.session.flush()
                    break
                except IntegrityError:
                    db.session.rollback()
                    print(f"Duplicate user data generated. Retrying...")
        
        db.session.commit()

        print("Creating categories...")
        categories = []
        for _ in range(5):
            category = Category(name=random.choice(['Tables', 'Couches', 'Storage', 'Beds']), description=fake.sentence())
            categories.append(category)
            db.session.add(category)
        db.session.commit()

        print("Creating products...")
        products = []
        for _ in range(min(20, len(SAMPLE_PRODUCT_NAMES))):
            image_url = generate_image_url()
            product_name = SAMPLE_PRODUCT_NAMES.pop(random.randrange(len(SAMPLE_PRODUCT_NAMES)))
            product = Product(
                name=product_name,
                description=fake.paragraph(),
                image_url=image_url,
                price=round(random.uniform(50, 1000), 2),
                stock_quantity=random.randint(0, 100),
                category=random.choice(categories)
            )
            products.append(product)
            db.session.add(product)
        db.session.commit()

        print("Creating orders and items...")
        for shopper in shoppers:
            for _ in range(random.randint(1, 3)):
                order = Order(shopper=shopper, total_amount=0, status=random.choice(['pending', 'completed', 'shipped']))
                db.session.add(order)
                db.session.flush()

                for _ in range(random.randint(1, 5)):
                    product = random.choice(products)
                    quantity = random.randint(1, 3)
                    order_item = OrderItem(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price=product.price
                    )
                    db.session.add(order_item)
                    order.total_amount += order_item.price * order_item.quantity
        db.session.commit()

        print("Creating carts and cart items...")
        for shopper in shoppers:
            cart = Cart(shopper=shopper)
            db.session.add(cart)
            db.session.flush()

            for _ in range(random.randint(1, 5)):
                product = random.choice(products)
                cart_item = CartItem(
                    cart=cart,
                    product=product,
                    quantity=random.randint(1, 3)
                )
                db.session.add(cart_item)
        db.session.commit()

        print("Creating reviews...")
        for product in products:
            for _ in range(random.randint(0, 5)):
                review = Review(
                    product=product,
                    shopper=random.choice(shoppers),
                    rating=random.randint(1, 5),
                    comment=fake.paragraph()
                )
                db.session.add(review)
        db.session.commit()

        print("Creating product analytics...")
        for product in products:
            analytics = ProductAnalytics(
                product=product,
                views=random.randint(0, 1000),
                purchases=random.randint(0, 100),
                revenue=round(random.uniform(0, 50000), 2)  
            )
            db.session.add(analytics)
        db.session.commit()

        print("Creating order analytics...")
        for _ in range(30):
            order_analytics = OrderAnalytics(
                date=fake.date_this_year(),
                total_orders=random.randint(0, 100),
                total_revenue=round(random.uniform(0, 100000), 2)
            )
            db.session.add(order_analytics)
        db.session.commit()

        print("Creating search logs...")
        for _ in range(50):
            search_log = SearchLog(
                shopper=random.choice(shoppers),
                query=fake.word(),
                category=random.choice([None] + [c.name for c in categories])
            )
            db.session.add(search_log)
        db.session.commit()

if __name__ == '__main__':
    seed_database()
    print("Database seeded successfully!")
