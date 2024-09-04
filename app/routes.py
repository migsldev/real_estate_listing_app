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

# Property Management
@main.route('/properties', methods=['GET', 'POST'])
@jwt_required()
def manage_properties():
    current_user = get_jwt_identity()

    # If POST: Only agents can create properties
    if request.method == 'POST':
        if current_user['role'] != 'agent':
            return jsonify({"message": "Unauthorized: Only agents can create properties."}), 403

        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        price = data.get('price')
        location = data.get('location')

        # Create the new property
        new_property = Property(
            title=title,
            description=description,
            price=price,
            location=location,
            listed_by=current_user['id'],
            is_approved=True  # Ensure properties are approved by default
        )

        db.session.add(new_property)
        db.session.commit()

        return property_schema.jsonify(new_property), 201

    # If GET: Buyers and agents can see properties
    if current_user['role'] == 'agent':
        # Agents can see all properties they created
        properties = Property.query.filter_by(listed_by=current_user['id']).all()
    elif current_user['role'] == 'buyer':
        # Buyers can only see open properties
        properties = Property.query.all()
    else:
        return jsonify({"message": "Unauthorized: Invalid role."}), 403

    return jsonify(property_schema.dump(properties, many=True)), 200

@main.route('/wishlist', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def manage_wishlist():
    current_user = get_jwt_identity()

    # GET method to retrieve the wishlist items
    if request.method == 'GET':
        wishlist_items = Wishlist.query.filter_by(user_id=current_user['id']).all()
        return jsonify(wishlist_schema.dump(wishlist_items, many=True)), 200

    # POST method to add a property to the wishlist
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

    # DELETE method to remove a property from the wishlist
    if request.method == 'DELETE':
        data = request.get_json()
        property_id = data.get('property_id')

        wishlist_item = Wishlist.query.filter_by(user_id=current_user['id'], property_id=property_id).first()
        if not wishlist_item:
            return jsonify({"message": "Wishlist item not found"}), 404

        db.session.delete(wishlist_item)
        db.session.commit()

        return jsonify({"message": "Wishlist item removed"}), 200

# Application Approve/Reject (Agent Only)
@main.route('/applications/<int:id>', methods=['PUT'])
@jwt_required()
def update_application(id):
    current_user = get_jwt_identity()

    # Ensure only agents can approve or reject applications
    if current_user['role'] != 'agent':
        return jsonify({"message": "Unauthorized: Only agents can approve/reject applications."}), 403

    application = Application.query.get_or_404(id)
    data = request.get_json()
    status = data.get('status')

    # Validate status
    if status not in ['approved', 'rejected']:
        return jsonify({"message": "Invalid status"}), 400

    application.status = status
    db.session.commit()

    return application_schema.jsonify(application), 200

# View Applications (Agent Only)
@main.route('/applications', methods=['GET'])
@jwt_required()
def view_applications():
    current_user = get_jwt_identity()

    # Ensure only agents can view applications
    #if current_user['role'] != 'agent':
#    return jsonify({"message": "Unauthorized: Only agents can view applications."}), 403

    applications = Application.query.all()
    return jsonify(application_schema.dump(applications, many=True)), 200