from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, Claim, Policy, User
from marshmallow import Schema, fields, ValidationError
from datetime import datetime
import uuid

claims_bp = Blueprint('claims', __name__, url_prefix='/api/claims')

class ClaimSchema(Schema):
    id = fields.String(dump_only=True)
    claim_number = fields.String(dump_only=True)
    policy_id = fields.String(required=True)
    agent_id = fields.String(dump_only=True)
    claim_amount = fields.Float(required=True)
    reason = fields.String(required=True)
    status = fields.String(dump_only=True)
    submission_date = fields.DateTime(dump_only=True)
    decision_date = fields.DateTime(dump_only=True)
    remarks = fields.String()
    created_at = fields.DateTime(dump_only=True)

claim_schema = ClaimSchema()
claims_schema = ClaimSchema(many=True)

@claims_bp.route('', methods=['POST'])
@jwt_required()
def submit_claim():
    """Submit a new claim"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    try:
        data = claim_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    # Verify policy exists
    policy = Policy.query.get(data['policy_id'])
    if not policy:
        return jsonify({'error': 'Policy not found'}), 404
    
    # Customer can only submit claims for their own policies
    if user.role == 'customer' and policy.customer_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    claim = Claim(
        claim_number=f"CLM-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
        policy_id=data['policy_id'],
        claim_amount=data['claim_amount'],
        reason=data['reason']
    )
    
    db.session.add(claim)
    db.session.commit()
    
    return jsonify({
        'message': 'Claim submitted successfully',
        'claim': claim_schema.dump(claim)
    }), 201

@claims_bp.route('', methods=['GET'])
@jwt_required()
def get_claims():
    """Get claims"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    status = request.args.get('status')
    
    if user.role == 'admin':
        if status:
            claims = Claim.query.filter_by(status=status).all()
        else:
            claims = Claim.query.all()
    elif user.role == 'agent':
        if status:
            claims = Claim.query.filter(
                Claim.agent_id == user_id,
                Claim.status == status
            ).all()
        else:
            claims = Claim.query.filter_by(agent_id=user_id).all()
    elif user.role == 'customer':
        claims = Claim.query.join(Policy).filter(
            Policy.customer_id == user_id
        ).all()
    else:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(claims_schema.dump(claims)), 200

@claims_bp.route('/<claim_id>', methods=['GET'])
@jwt_required()
def get_claim(claim_id):
    """Get claim details"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    claim = Claim.query.get(claim_id)
    
    if not claim:
        return jsonify({'error': 'Claim not found'}), 404
    
    # Check authorization
    if user.role == 'agent' and claim.agent_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if user.role == 'customer' and claim.policy.customer_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(claim_schema.dump(claim)), 200

@claims_bp.route('/<claim_id>/assign', methods=['PUT'])
@jwt_required()
def assign_claim(claim_id):
    """Assign claim to an agent"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    claim = Claim.query.get(claim_id)
    
    if not claim:
        return jsonify({'error': 'Claim not found'}), 404
    
    data = request.get_json()
    agent_id = data.get('agent_id')
    
    # Verify agent exists
    agent = User.query.filter_by(id=agent_id, role='agent').first()
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    
    claim.agent_id = agent_id
    db.session.commit()
    
    return jsonify({
        'message': 'Claim assigned successfully',
        'claim': claim_schema.dump(claim)
    }), 200

@claims_bp.route('/<claim_id>/approve', methods=['PUT'])
@jwt_required()
def approve_claim(claim_id):
    """Approve a claim"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'agent']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    claim = Claim.query.get(claim_id)
    
    if not claim:
        return jsonify({'error': 'Claim not found'}), 404
    
    data = request.get_json()
    claim.status = 'approved'
    claim.decision_date = datetime.utcnow()
    claim.remarks = data.get('remarks', '')
    
    db.session.commit()
    
    return jsonify({
        'message': 'Claim approved successfully',
        'claim': claim_schema.dump(claim)
    }), 200

@claims_bp.route('/<claim_id>/reject', methods=['PUT'])
@jwt_required()
def reject_claim(claim_id):
    """Reject a claim"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'agent']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    claim = Claim.query.get(claim_id)
    
    if not claim:
        return jsonify({'error': 'Claim not found'}), 404
    
    data = request.get_json()
    claim.status = 'rejected'
    claim.decision_date = datetime.utcnow()
    claim.remarks = data.get('remarks', '')
    
    db.session.commit()
    
    return jsonify({
        'message': 'Claim rejected successfully',
        'claim': claim_schema.dump(claim)
    }), 200
