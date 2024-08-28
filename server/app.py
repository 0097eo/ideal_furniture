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

# Initialize Flask-JWT
jwt = JWTManager(app)

# Initialize Flask-Admin
admin_panel = FlaskAdmin(app, name='Ideal Furniture & Decor', template_mode='bootstrap3')

# User Authentication
class UserRegistration(Resource):
    def post(self):
        data = request.get_json()
        hashed_password = generate_password_hash(data['password'])
        new_user = Shopper(
            username=data['username'],
            email=data['email'],
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()
        return {'message': 'User created successfully'}, 201

class UserLogin(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and check_password_hash(user.password, data['password']):
            access_token = create_access_token(identity=user.id)
            return {'access_token': access_token}, 200
        return {'message': 'Invalid credentials'}, 401

# Product Listing
class ProductList(Resource):
    def get(self):
        category_id = request.args.get('category_id')
        if category_id:
            products = Product.query.filter_by(category_id=category_id).all()
        else:
            products = Product.query.all()
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'image_url': p.image_url,
            'category_id': p.category_id
        } for p in products])

# Cart Management
class CartResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        cart = Cart.query.filter_by(shopper_id=user_id).first()
        if not cart:
            return {'message': 'Cart is empty'}, 200
        return jsonify([{
            'id': item.id,
            'product_id': item.product_id,
            'product_name': item.product.name,
            'quantity': item.quantity,
            'price': item.product.price
        } for item in cart.items])

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        cart = Cart.query.filter_by(shopper_id=user_id).first()
        if not cart:
            cart = Cart(shopper_id=user_id)
            db.session.add(cart)
        
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=data['product_id'],
            quantity=data['quantity']
        )
        db.session.add(cart_item)
        db.session.commit()
        return {'message': 'Item added to cart'}, 201

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
        
        # Create order items
        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            db.session.add(order_item)
        
        # Clear cart
        for item in cart.items:
            db.session.delete(item)
        
        db.session.commit()
        
        # Simulate payment process (In a real app, you'd integrate with a payment gateway)
        # Generate dummy address and billing info
        address = "123 Main St, Anytown, USA"
        billing_info = "Card ending in 1234"
        invoice_number = f"INV-{order.id}"
        
        return {
            'message': 'Order placed successfully',
            'order_id': order.id,
            'total_amount': total_amount,
            'address': address,
            'billing_info': billing_info,
            'invoice_number': invoice_number
        }, 201

# Enhanced Admin Views
class SecureModelView(ModelView):
    form_base_class = SecureForm
    
    def is_accessible(self):
        # In a real application, you'd check if the current user is an admin
        # For simplicity, we're always returning True here
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
api.add_resource(UserLogin, '/login')
api.add_resource(ProductList, '/products')
api.add_resource(CartResource, '/cart')
api.add_resource(CheckoutResource, '/checkout')

if __name__ == '__main__':
    app.run(port=5555, debug=True)