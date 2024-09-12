from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import User, Property, Application, Wishlist
from app.schemas import UserSchema, PropertySchema, ApplicationSchema, WishlistSchema
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

main = Blueprint('main', __name__)

user_schema = UserSchema()
property_schema = PropertySchema()
application_schema = ApplicationSchema()
wishlist_schema = WishlistSchema()

# User Registration
@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = generate_password_hash(data.get('password'))
    role = data.get('role')

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    new_user = User(username=username, email=email, password=password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return user_schema.jsonify(new_user), 201

@main.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity={'id': user.id, 'username': user.username, 'role': user.role})
    return jsonify({
        "access_token": access_token,
        "user_role": user.role  # Return the user's role (agent/buyer)
    }), 200

# Property Management (List, Create, Update, Delete)
@main.route('/properties', methods=['GET', 'POST'])
@jwt_required()
def manage_properties():
    current_user = get_jwt_identity()
    
    if request.method == 'POST':
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        price = data.get('price')
        location = data.get('location')
        property_type = data.get('property_type')  # Get the property type from the request

        new_property = Property(
            title=title,
            description=description,
            price=price,
            location=location,
            listed_by=current_user['id'],
            property_type=property_type  # Add property type to the new property
        )

        db.session.add(new_property)
        db.session.commit()

        return property_schema.jsonify(new_property), 201

    properties = Property.query.all()
    return jsonify(property_schema.dump(properties, many=True)), 200

@main.route('/properties/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def modify_property(id):
    property = Property.query.get_or_404(id)
    current_user = get_jwt_identity()

    if request.method == 'PUT':
        data = request.get_json()

        if property.listed_by != current_user['id']:
            return jsonify({"message": "Unauthorized to update this property"}), 403

        property.title = data.get('title', property.title)
        property.description = data.get('description', property.description)
        property.price = data.get('price', property.price)
        property.location = data.get('location', property.location)
        property.property_type = data.get('property_type', property.property_type)  # Update property type if provided

        db.session.commit()

        return property_schema.jsonify(property), 200

    if request.method == 'DELETE':
        if property.listed_by != current_user['id']:
            return jsonify({"message": "Unauthorized to delete this property"}), 403

        db.session.delete(property)
        db.session.commit()

        return jsonify({"message": "Property deleted"}), 200

# Application Management (Submit, View)
@main.route('/applications', methods=['POST', 'GET'])
@jwt_required()
def manage_applications():
    current_user = get_jwt_identity()

    if request.method == 'POST':
        data = request.get_json()
        property_id = data.get('property_id')
        
        # Check if the property exists
        property = Property.query.get_or_404(property_id)

        new_application = Application(
            user_id=current_user['id'],
            property_id=property_id
        )

        db.session.add(new_application)
        db.session.commit()

        return application_schema.jsonify(new_application), 201

    applications = Application.query.filter_by(user_id=current_user['id']).all()
    return jsonify(application_schema.dump(applications, many=True)), 200

# Wishlist Management (Add, Remove)
@main.route('/wishlist', methods=['POST', 'DELETE'])
@jwt_required()
def manage_wishlist():
    current_user = get_jwt_identity()

    if request.method == 'POST':
        data = request.get_json()
        property_id = data.get('property_id')

        # Check if the property exists
        property = Property.query.get_or_404(property_id)

        new_wishlist_item = Wishlist(
            user_id=current_user['id'],
            property_id=property_id
        )

        db.session.add(new_wishlist_item)
        db.session.commit()

        return wishlist_schema.jsonify(new_wishlist_item), 201

    if request.method == 'DELETE':
        data = request.get_json()
        property_id = data.get('property_id')

        wishlist_item = Wishlist.query.filter_by(user_id=current_user['id'], property_id=property_id).first()
        if not wishlist_item:
            return jsonify({"message": "Wishlist item not found"}), 404

        db.session.delete(wishlist_item)
        db.session.commit()

        return jsonify({"message": "Wishlist item removed"}), 200

# View All Applications for Agent's Properties
@main.route('/agent/applications', methods=['GET'])
@jwt_required()
def view_agent_applications():
    current_user = get_jwt_identity()

    # Ensure the current user is an agent
    if current_user['role'] != 'agent':
        return jsonify({"message": "Unauthorized: Only agents can view applications for their properties"}), 403

    # Find properties listed by the agent
    agent_properties = Property.query.filter_by(listed_by=current_user['id']).all()

    # Get property IDs for properties listed by the agent
    property_ids = [property.id for property in agent_properties]

    # Fetch all applications for these properties
    applications = Application.query.filter(Application.property_id.in_(property_ids)).all()

    return jsonify(application_schema.dump(applications, many=True)), 200


@main.route('/applications/<int:application_id>/accept', methods=['PUT'])
@jwt_required()
def accept_application(application_id):
    current_user = get_jwt_identity()

    # Ensure the current user is an agent
    if current_user['role'] != 'agent':
        return jsonify({"message": "Unauthorized: Only agents can accept applications."}), 403

    # Find the application by ID
    application = Application.query.get_or_404(application_id)
    
    # Check if the property belongs to the agent
    property = Property.query.get(application.property_id)
    if property.listed_by != current_user['id']:
        return jsonify({"message": "Unauthorized: You do not own this property."}), 403

    # Update the application status to 'approved'
    application.status = 'approved'
    db.session.commit()

    return application_schema.jsonify(application), 200


@main.route('/applications/<int:application_id>/reject', methods=['PUT'])
@jwt_required()
def reject_application(application_id):
    current_user = get_jwt_identity()

    # Ensure the current user is an agent
    if current_user['role'] != 'agent':
        return jsonify({"message": "Unauthorized: Only agents can reject applications."}), 403

    # Find the application by ID
    application = Application.query.get_or_404(application_id)

    # Check if the property belongs to the agent
    property = Property.query.get(application.property_id)
    if property.listed_by != current_user['id']:
        return jsonify({"message": "Unauthorized: You do not own this property."}), 403

    # Update the application status to 'rejected'
    application.status = 'rejected'
    db.session.commit()

    return application_schema.jsonify(application), 200


# Function to delete an application
@main.route('/applications/<int:application_id>', methods=['DELETE'])
@jwt_required()
def delete_application(application_id):
    current_user = get_jwt_identity()

    # Find the application by ID
    application = Application.query.get_or_404(application_id)

    # Check if the current user is the owner of the application
    if application.user_id != current_user['id']:
        return jsonify({"message": "Unauthorized: You can only delete your own applications."}), 403

    # Delete the application
    db.session.delete(application)
    db.session.commit()

    return jsonify({"message": "Application deleted successfully."}), 200


# Get Wishlist Items
@main.route('/wishlist', methods=['GET'])
@jwt_required()
def get_wishlist_items():
    current_user = get_jwt_identity()  # Get the current logged-in user
    user_id = current_user['id']

    # Query wishlist items for the logged-in user
    wishlist_items = Wishlist.query.filter_by(user_id=user_id).all()

    if not wishlist_items:
        return jsonify({"message": "No items found in the wishlist."}), 200

    return wishlist_schema.jsonify(wishlist_items), 200


# Get all wishlist items for the logged-in user
@main.route('/wishlist', methods=['GET'])
@jwt_required()
def get_wishlist():
    current_user = get_jwt_identity()  # Get the logged-in user

    # Query the wishlist for the current user
    wishlist_items = Wishlist.query.filter_by(user_id=current_user['id']).all()

    # Fetch the properties that are in the wishlist
    property_ids = [item.property_id for item in wishlist_items]
    properties_in_wishlist = Property.query.filter(Property.id.in_(property_ids)).all()

    return property_schema.jsonify(properties_in_wishlist, many=True), 200
