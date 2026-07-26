from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, Customer, User
from marshmallow import Schema, fields, ValidationError
from datetime import datetime

customers_bp = Blueprint('customers', __name__, url_prefix='/api/customers')

class CustomerSchema(Schema):
    id = fields.String(dump_only=True)
    name = fields.String(required=True)
    email = fields.Email(required=True)
    phone = fields.String(required=True)
    dob = fields.Date(required=True)
    address = fields.String(required=True)
    agent_id = fields.String()
    created_at = fields.DateTime(dump_only=True)

customer_schema = CustomerSchema()
customers_schema = CustomerSchema(many=True)

@customers_bp.route('', methods=['POST'])
@jwt_required()
def create_customer():
    """Create a new customer"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Only admin and agents can create customers
    if user.role not in ['admin', 'agent']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        data = customer_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    # Check if customer email already exists
    if Customer.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Customer with this email already exists'}), 409
    
    customer = Customer(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        dob=data['dob'],
        address=data['address'],
        agent_id=user.id if user.role == 'agent' else None
    )
    
    db.session.add(customer)
    db.session.commit()
    
    return jsonify({
        'message': 'Customer created successfully',
        'customer': customer_schema.dump(customer)
    }), 201

@customers_bp.route('', methods=['GET'])
@jwt_required()
def get_customers():
    """Get all customers (filtered by role)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role == 'admin':
        customers = Customer.query.all()
    elif user.role == 'agent':
        customers = Customer.query.filter_by(agent_id=user_id).all()
    else:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(customers_schema.dump(customers)), 200

@customers_bp.route('/<customer_id>', methods=['GET'])
@jwt_required()
def get_customer(customer_id):
    """Get customer details"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    customer = Customer.query.get(customer_id)
    
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    
    # Customers can only view their own profile
    if user.role == 'customer' and user_id != customer_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Agents can only view their customers
    if user.role == 'agent' and customer.agent_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(customer_schema.dump(customer)), 200

@customers_bp.route('/<customer_id>', methods=['PUT'])
@jwt_required()
def update_customer(customer_id):
    """Update customer information"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    customer = Customer.query.get(customer_id)
    
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    
    # Only admins and the customer themselves can update
    if user.role not in ['admin'] and user_id != customer_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        data = customer_schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    for key, value in data.items():
        if key != 'id':
            setattr(customer, key, value)
    
    customer.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Customer updated successfully',
        'customer': customer_schema.dump(customer)
    }), 200

@customers_bp.route('/<customer_id>', methods=['DELETE'])
@jwt_required()
def delete_customer(customer_id):
    """Delete a customer"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    customer = Customer.query.get(customer_id)
    
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    
    db.session.delete(customer)
    db.session.commit()
    
    return jsonify({'message': 'Customer deleted successfully'}), 200
