import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [newProperty, setNewProperty] = useState({ title: '', description: '', price: '', location: '' });
    const [updateProperty, setUpdateProperty] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // State for success messages
    const [propertyId, setPropertyId] = useState(null);

    useEffect(() => {
        fetchProperties();
    }, []);

const fetchProperties = async () => {
    try {
        const response = await axios.get('/properties', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log(response.data); // Log the response data
        setProperties(response.data);
    } catch (error) {
        setError('Error fetching properties');
    }
};


  const handleCreateProperty = async (event) => {
        event.preventDefault();
        try {
            // Send POST request to create the property
            const response = await axios.post('/properties', newProperty, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Extract the property ID from the response
            const createdProperty = response.data; // Adjust according to your response structure
            const id = createdProperty.id;

            // Update state with the new property ID and success message
            setPropertyId(id);
            setSuccess('Property created successfully!');

            // Clear the form fields
            setNewProperty({ title: '', description: '', price: '', location: '' });
            fetchProperties();
        } catch (error) {
            setError('Error creating property');
        }
    };


    const handleUpdateProperty = async (event) => {
        event.preventDefault();
        try {
            await axios.put(`/properties/${updateProperty.id}`, updateProperty, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUpdateProperty(null);
            fetchProperties();
        } catch (error) {
            setError('Error updating property');
        }
    };

    const handleDeleteProperty = async (id) => {
        try {
            await axios.delete(`/properties/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchProperties();
        } catch (error) {
            setError('Error deleting property');
        }
    };

const handleAddToWishlist = async (id) => {
    try {
        await axios.post('/wishlist', { property_id: id }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccess('Property added to wishlist successfully!');
        
        // Refresh properties to update wishlist status
        fetchProperties(); 
    } catch (error) {
        setError('Error adding to wishlist');
    }
};


    const handleApplyToProperty = async (id) => {
        try {
            await axios.post(`/applications/agent`, { property_id: id }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Application submitted successfully!');
            fetchProperties(); // Refresh properties if needed
        } catch (error) {
            setError('Error applying to property');
        }
    };

    return (
        <div>
            <h2>Properties</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>} {/* Display success message */}
            <form onSubmit={handleCreateProperty}>
                <input
                    type="text"
                    placeholder="Title"
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newProperty.description}
                    onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={newProperty.location}
                    onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
                    required
                />
                <button type="submit">Create Property</button>
            </form>
            {/*}Display the property ID after successful creation */}
            {propertyId && <p>Created Property ID: {propertyId}</p>}
            {updateProperty && (
                <form onSubmit={handleUpdateProperty}>
                    <h3>Update Property</h3>
                    <input
                        type="text"
                        placeholder="Title"
                        value={updateProperty.title}
                        onChange={(e) => setUpdateProperty({ ...updateProperty, title: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={updateProperty.description}
                        onChange={(e) => setUpdateProperty({ ...updateProperty, description: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={updateProperty.price}
                        onChange={(e) => setUpdateProperty({ ...updateProperty, price: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Location"
                        value={updateProperty.location}
                        onChange={(e) => setUpdateProperty({ ...updateProperty, location: e.target.value })}
                        required
                    />
                    <button type="submit">Update Property</button>
                    <button type="button" onClick={() => setUpdateProperty(null)}>Cancel</button>
                </form>
            )}
            <div>
                <Link to="/applications">
                    <button>Applications</button>
                </Link>
                <Link to="/wishlist">
                    <button>Wishlist</button>
                </Link>
            </div>
            <ul>
                {properties.length > 0 ? (
                    properties.map(property => (
                        <li key={property.id}>
                            <h3>Property ID: {property.id}</h3>
                            <p>Title: {property.title || 'No Title'}</p>
                            <p>Description: {property.description || 'No Description'}</p>
                            <p>Price: {property.price || 'No Price'}</p>
                            <p>Location: {property.location || 'No Location'}</p>
                            <button onClick={() => handleApplyToProperty(property.id)}>Apply</button>
                            <button onClick={() => handleAddToWishlist(property.id)}>
                                {property.isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            </button>
                            <button onClick={() => setUpdateProperty(property)}>Edit</button>
                            <button onClick={() => handleDeleteProperty(property.id)}>Delete</button>
                        </li>
                    ))
                ) : (
                    <p>No properties available.</p>
                )}
            </ul>
        </div>
    );
};

export default Properties;
