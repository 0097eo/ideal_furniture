# Ideal Furniture & Decor
## Overview
This project creates an intelligent e-commerce search engine for a furniture shop that can identify product categories based on customer searches. The system aims to determine whether a customer is searching for a specific furniture item or category, increasing the relevance and precision of search results. Additionally, it integrates the Daraja API for secure payment processing.

## Features
### User Features
#### User Authentication:
- Login functionality
- Account creation
#### Product Management:
- Categorized listing of items (beds, chairs, couches, mattresses, tables, wardrobes)
- Cart system for viewing selected products
- Checkout process with integrated Daraja API payment gateway
### Admin Features
#### Product Management:
- CRUD operations for furniture items
- User role management for product and order administration
#### Analytics:
- Product performance analytics
- Order analytics

## Tech Stack
- Backend: Flask (Python)
- Database: SQLAlchemy
- Wireframes: Figma 
- Testing Framework: Unittest
- Frontend: ReactJs 
- Payment Gateway: Daraja API

## Installation and setup
1. Clone the repository
   ```
   git clone
   ```
2. Install the dependencies
   ```
   pipenv install
   npm install
   ```
3. Setup the database
   ```
   flask db init
   flask db migrate
   flask db upgrade
   ```
4. Seed the database
   ```
   python seed.py
   ```
5. Run the backend
   ```
   python app.py
   ```
6. Run the frontend
   ```
   npm start
   ```
## Usage
1. Navigate to the frontend URL (usually http://localhost:3000)
2. Create an account or log in
3. Browse through furniture categories and add items to cart
4. Proceed to checkout and use the integrated Daraja API payment gateway

## Contributing
Contributions are welcome! Please follow these steps:
- Fork the repository.
- Create a feature branch (git checkout -b feature-branch).
- Commit your changes (git commit -am 'Add new feature').
- Push to the branch (git push origin feature-branch).
- Open a Pull Request

## License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) 
   
