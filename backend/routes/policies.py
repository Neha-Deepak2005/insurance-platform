from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, Policy, Customer, User
from marshmallow import Schema, fields, ValidationError
from datetime import datetime
import uuid

policies_bp = Blueprint('policies', __name__, url_prefix='/api/policies')

class PolicySchema(Schema):
    id = fields.String(dump_only=True)
    policy_number = fields.String(dump_only=True)
    customer_id = fields.String(required=True)
    policy_type = fields.String(required=True)
    premium_amount = fields.Float(required=True)
    start_date = fields.Date(required=True)
    end_date = fields.Date(required=True)
    status = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

policy_schema = PolicySchema()
policies_schema = PolicySchema(many=True)

@policies_bp.route('', methods=['POST'])
@jwt_required()
def create_policy():
    """Create a new insurance policy"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'agent']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        data = policy_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    # Verify customer exists
    customer = Customer.query.get(data['customer_id'])
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    
    policy = Policy(
        policy_number=f"POL-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
        customer_id=data['customer_id'],
        policy_type=data['policy_type'],
        premium_amount=data['premium_amount'],
        start_date=data['start_date'],
        end_date=data['end_date']
    )
    
    db.session.add(policy)
    db.session.commit()
    
    return jsonify({
        'message': 'Policy created successfully',
        'policy': policy_schema.dump(policy)
    }), 201

@policies_bp.route('', methods=['GET'])
@jwt_required()
def get_policies():
    """Get policies"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    customer_id = request.args.get('customer_id')
    
    if user.role == 'admin':
        if customer_id:
            policies = Policy.query.filter_by(customer_id=customer_id).all()
        else:
            policies = Policy.query.all()
    elif user.role == 'agent':
        policies = Policy.query.join(Customer).filter(
            Customer.agent_id == user_id
        ).all()
    elif user.role == 'customer':
        policies = Policy.query.filter_by(customer_id=user_id).all()
    else:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(policies_schema.dump(policies)), 200

@policies_bp.route('/<policy_id>', methods=['GET'])
@jwt_required()
def get_policy(policy_id):
    """Get policy details"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    policy = Policy.query.get(policy_id)
    
    if not policy:
        return jsonify({'error': 'Policy not found'}), 404
    
    # Check authorization
    if user.role == 'customer' and policy.customer_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(policy_schema.dump(policy)), 200

@policies_bp.route('/<policy_id>', methods=['PUT'])
@jwt_required()
def update_policy(policy_id):
    """Update policy"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'agent']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    policy = Policy.query.get(policy_id)
    
    if not policy:
        return jsonify({'error': 'Policy not found'}), 404
    
    try:
        data = policy_schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    for key, value in data.items():
        if key not in ['id', 'policy_number', 'customer_id']:
            setattr(policy, key, value)
    
    policy.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Policy updated successfully',
        'policy': policy_schema.dump(policy)
    }), 200

@policies_bp.route('/<policy_id>/renew', methods=['POST'])
@jwt_required()
def renew_policy(policy_id):
    """Renew a policy"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'agent']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    policy = Policy.query.get(policy_id)
    
    if not policy:
        return jsonify({'error': 'Policy not found'}), 404
    
    from datetime import timedelta
    policy.status = 'active'
    policy.end_date = policy.end_date + timedelta(days=365)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Policy renewed successfully',
        'policy': policy_schema.dump(policy)
    }), 200

@policies_bp.route('/<policy_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_policy(policy_id):
    """Cancel a policy"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'agent']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    policy = Policy.query.get(policy_id)
    
    if not policy:
        return jsonify({'error': 'Policy not found'}), 404
    
    policy.status = 'cancelled'
    policy.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Policy cancelled successfully',
        'policy': policy_schema.dump(policy)
    }), 200
