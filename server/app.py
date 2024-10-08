from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flask_admin import Admin as FlaskAdmin
from flask_admin.contrib.sqla import ModelView
from flask_admin.form import SecureForm
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from wtforms import PasswordField
from config import app, db, api
from models import User, Shopper, Admin, Product, Category, Order, OrderItem, Cart, CartItem, Review, ProductAnalytics, OrderAnalytics
import secrets
from email.mime.text import MIMEText
import smtplib
from datetime import timedelta, datetime
import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv
import base64

load_dotenv()
# Daraja API credentials
DARAJA_CONSUMER_KEY = os.getenv('DARAJA_CONSUMER_KEY')
DARAJA_CONSUMER_SECRET = os.getenv('DARAJA_CONSUMER_SECRET')
DARAJA_SHORTCODE = os.getenv('DARAJA_SHORTCODE')
DARAJA_PASSKEY = os.getenv('DARAJA_PASSKEY')
DARAJA_BASE_URL = "https://sandbox.safaricom.co.ke"

# Initialize Flask-JWT
jwt = JWTManager(app)

# Initialize Flask-Admin
admin_panel = FlaskAdmin(app, name='Ideal Furniture & Decor', template_mode='bootstrap3')

#daraja accesstoken
def generate_daraja_token():
    auth_url = f"{DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    response = requests.get(auth_url, auth=HTTPBasicAuth(DARAJA_CONSUMER_KEY, DARAJA_CONSUMER_SECRET))
    response_json = response.json()
    return response_json['access_token']


# User verification
def send_verification_email(email, verification_code):
    sender = 'emmanuelokello294@gmail.com'
    recipient = email
    subject = 'Ideal Furniture & Decor - Verify your email'
    body = f'Your verification code is : {verification_code}'

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = recipient

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login('emmanuelokello294@gmail.com', 'quzo ygrw gcse maim')
            smtp.send_message(msg)
    except smtplib.SMTPException as e:
        print(f"Error sending verification email: {e}")
        raise e
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise e

# User Authentication
class UserRegistration(Resource):
    def post(self):
        data = request.get_json()
        if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
            return {'error': 'Username or email already exists'}, 400

        verification_code = secrets.token_hex(3)
        new_user = Shopper(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            verification_code=verification_code,
            is_verified=False
        )
        db.session.add(new_user)
        db.session.commit()

        try:
            send_verification_email(data['email'], verification_code)
            return {'message': 'User created. Please check your email for verification.'}, 201
        except Exception as e:
            db.session.delete(new_user)
            db.session.commit()
            return {'error': 'Failed to send verification email.'}, 500
        
class VerifyEmail(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        verification_code = data.get('verification_code')

        if not email or not verification_code:
            return {'error': 'Missing email or verification code'}, 400

        user = User.query.filter_by(email=email).first()

        if not user or user.verification_code != verification_code:
            return {'error': 'Invalid email or verification code'}, 401

        user.is_verified = True
        user.verification_code = None
        db.session.commit()

        return {'message': 'Email verified successfully'}, 200

class UserLogin(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and user.check_password(data['password']):
            if not user.is_verified:
                return {'message': 'Please verify your email before logging in.'}, 401
            access_token = create_access_token(identity=user.id, expires_delta=timedelta(days=10))
            return {'access_token': access_token}, 200
        return {'message': 'Invalid credentials'}, 401
    

class UserProfileResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return {'message': 'User not found'}, 404
        
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_verified': user.is_verified
        }, 200


# Product Listing
class ProductList(Resource):
    def get(self):
        # Get pagination and search query parameters from the request
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search_query = request.args.get('q', '', type=str)

        # Filter by category if provided
        category_id = request.args.get('category_id')
        query = Product.query
        
        if category_id:
            query = query.filter_by(category_id=category_id)

        if search_query:
            # Filter products by name or description using the search query
            query = query.filter(
                db.or_(
                    Product.name.ilike(f'%{search_query}%'),
                    Product.description.ilike(f'%{search_query}%')
                )
            )
        
        # Apply pagination
        paginated_products = query.paginate(page=page, per_page=per_page, error_out=False)

        # Return the paginated results
        return jsonify({
            'products': [{
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'price': p.price,
                'image_url': p.image_url,
                'category_id': p.category_id
            } for p in paginated_products.items],
            'total': paginated_products.total,
            'page': paginated_products.page,
            'pages': paginated_products.pages
        })


# Cart Management
class CartResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        cart = Cart.query.filter_by(shopper_id=user_id).first()
        if not cart:
            return {'message': 'Cart is empty'}, 200

        cart_items = CartItem.query.filter_by(cart_id=cart.id).all()
        if not cart_items:
            return {'message': 'No items in cart'}, 200

        return jsonify([{
            'id': item.id,
            'product_id': item.product_id,
            'product_name': item.product.name,
            'quantity': item.quantity,
            'image_url': item.product.image_url,
            'price': item.product.price
        } for item in cart_items])

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        cart = Cart.query.filter_by(shopper_id=user_id).first()
        if not cart:
            cart = Cart(shopper_id=user_id)
            db.session.add(cart)
            db.session.commit()

        cart_item = CartItem(
            cart_id=cart.id,
            product_id=data['product_id'],
            quantity=data['quantity']
        )
        db.session.add(cart_item)
        db.session.commit()
        return {'message': 'Item added to cart'}, 201
    
    @jwt_required()
    def delete(self, cart_item_id):
        user_id = get_jwt_identity()
        cart = Cart.query.filter_by(shopper_id=user_id).first()
        if not cart:
            return {'message': 'Cart not found'}, 404
        
        cart_item = CartItem.query.filter_by(cart_id=cart.id, id=cart_item_id).first()
        if not cart_item:
            return {'message': 'Cart item not found'}, 404
        
        db.session.delete(cart_item)
        db.session.commit()
        return {'message': 'Item removed from cart'}, 200
    
    @jwt_required()
    def put(self, cart_item_id):
        user_id = get_jwt_identity()
        data = request.get_json()
        new_quantity = data.get('quantity')
        
        if not new_quantity or new_quantity <= 0:
            return {'message': 'Invalid quantity'}, 400
        
        cart = Cart.query.filter_by(shopper_id=user_id).first()
        if not cart:
            return {'message': 'Cart not found'}, 404
        
        cart_item = CartItem.query.filter_by(cart_id=cart.id, id=cart_item_id).first()
        if not cart_item:
            return {'message': 'Cart item not found'}, 404
        
        cart_item.quantity = new_quantity
        db.session.commit()
        return {'message': 'Cart item updated'}, 200

# Checkout Process
class CheckoutResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        cart = Cart.query.filter_by(shopper_id=user_id).first()
        if not cart or not cart.items:
            return {'message': 'Cart is empty'}, 400
        
        # Calculate total amount
        total_amount = sum(item.product.price * item.quantity for item in cart.items)
        
        # Create order
        order = Order(shopper_id=user_id, total_amount=total_amount)
        db.session.add(order)
        db.session.commit()
        
        # Create order items
        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            db.session.add(order_item)

        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
            
        # Initiate M-Pesa Payment
        access_token = generate_daraja_token()
        payment_url = f"{DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(f"{DARAJA_SHORTCODE}{DARAJA_PASSKEY}{timestamp}".encode()).decode('utf-8')
        payload = {
            "BusinessShortCode": DARAJA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": total_amount,
            "PartyA": "254706446211", 
            "PartyB": DARAJA_SHORTCODE,
            "PhoneNumber": "254706446211", 
            "CallBackURL": "https://mydomain.com/path", 
            "AccountReference": f"Order-{order.id}",
            "TransactionDesc": f"Payment for Order-{order.id}"
        }

        response = requests.post(payment_url, json=payload, headers=headers)
        response_json = response.json()

        if response_json.get("ResponseCode") == "0":
            return {
                'message': 'Order placed successfully, awaiting payment confirmation',
                'order_id': order.id,
                'total_amount': total_amount,
                'payment_request': response_json
            }, 201
        else:
            return {
                'message': 'Failed to initiate payment',
                'error': response_json
            }, 400
        
class OrderResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        orders = Order.query.filter_by(shopper_id=user_id).all()
        
        if not orders:
            return {'message': 'No orders found'}, 404
        
        order_list = []
        for order in orders:
            order_items = OrderItem.query.filter_by(order_id=order.id).all()
            order_list.append({
                'order_id': order.id,
                'total_amount': order.total_amount,
                'status': order.status,
                'created_at': order.created_at,
                'items': [{
                    'product_id': item.product_id,
                    'product_name': item.product.name,
                    'quantity': item.quantity,
                    'price': item.price,
                    'image_url': item.product.image_url
                } for item in order_items]
            })
        
        return jsonify(order_list)


# Enhanced Admin Views
class SecureModelView(ModelView):
    form_base_class = SecureForm
    
    def is_accessible(self):
        return True

class UserAdminView(SecureModelView):
    column_list = ('id', 'username', 'email', 'is_admin', 'is_verified')
    form_columns = ('username', 'email', 'password', 'is_admin', 'is_verified')
    form_extra_fields = {
        'password': PasswordField('Password')
    }

    def on_model_change(self, form, model, is_created):
        if form.password.data:
            model.password = generate_password_hash(form.password.data)

class ProductAdminView(SecureModelView):
    column_list = ('id', 'name', 'price', 'stock_quantity', 'category')
    form_columns = ('name', 'description', 'price', 'stock_quantity', 'category', 'image_url')

class OrderAdminView(SecureModelView):
    column_list = ('id', 'shopper', 'total_amount', 'status', 'created_at')
    form_columns = ('shopper', 'total_amount', 'status')

class ProductAnalyticsAdminView(SecureModelView):
    column_list = ('product', 'views', 'purchases', 'revenue')
    form_columns = ('product', 'views', 'purchases', 'revenue')

class OrderAnalyticsAdminView(SecureModelView):
    column_list = ('date', 'total_orders', 'total_revenue')
    form_columns = ('date', 'total_orders', 'total_revenue')

# Add views to admin
admin_panel.add_view(UserAdminView(User, db.session))
admin_panel.add_view(ProductAdminView(Product, db.session))
admin_panel.add_view(OrderAdminView(Order, db.session))
admin_panel.add_view(ProductAnalyticsAdminView(ProductAnalytics, db.session))
admin_panel.add_view(OrderAnalyticsAdminView(OrderAnalytics, db.session))

# Add resources to API
api.add_resource(UserRegistration, '/register')
api.add_resource(VerifyEmail, '/verify-email')
api.add_resource(UserLogin, '/login')
api.add_resource(UserProfileResource, '/profile')
api.add_resource(ProductList, '/products')
api.add_resource(CartResource, '/cart', '/cart/<cart_item_id>')
api.add_resource(CheckoutResource, '/checkout')
api.add_resource(OrderResource, '/orders')


if __name__ == '__main__':
    app.run(port=5555, debug=True)