import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './PropertyAgent.css'; // Import the CSS file

const PropertiesAgent = () => {
    const [properties, setProperties] = useState([]); // Initialize as an empty array
    const [applications, setApplications] = useState([]); // Store all applications for the agent's properties
    const [newProperty, setNewProperty] = useState({ title: '', description: '', price: '', location: '', property_type: 'Apartment' });
    const [updateProperty, setUpdateProperty] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [view, setView] = useState('pending'); // To control which tab is active (pending, approved, rejected)
    const navigate = useNavigate(); // Initialize useNavigate for redirection

    useEffect(() => {
        fetchProperties();
        fetchAgentApplications(); // Fetch all applications for agent's properties
    }, []);

    // Fetch all properties
    const fetchProperties = async () => {
        try {
            const response = await axios.get('/properties', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProperties(response.data || []);  // Ensure properties is always an array
        } catch (error) {
            setError('Error fetching properties');
        }
    };

    // Fetch all applications for the agent's properties
    const fetchAgentApplications = async () => {
        try {
            const response = await axios.get('/agent/applications', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setApplications(response.data || []); // Ensure applications is always an array
        } catch (error) {
            setError('Error fetching applications');
        }
    };

    // Function to get an image based on the property type
    const getImageForPropertyType = (propertyType) => {
        switch (propertyType) {
            case 'Apartment':
                return 'https://media.self.com/photos/630635c30b7f36ce816f374a/4:3/w_1920,c_limit/DAB03919-10470989.jpg';  // Replace with actual image path or URL
            case 'House':
                return 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';  // Replace with actual image path or URL
            case 'Room':
                return 'https://media.istockphoto.com/id/1467126728/photo/modern-scandinavian-and-japandi-style-bedroom-interior-design-with-bed-white-color-wooden.jpg?s=2048x2048&w=is&k=20&c=rH-g41fAFCZgBzStL9TayRqcxhkovnYEMb3yHXEIlvU=';  // Replace with actual image path or URL
            default:
                return 'path_to_default_image.jpg'; // Replace with a fallback image if no type matches
        }
    };

    // Create a new property
    const handleCreateProperty = async (event) => {
        event.preventDefault();
        try {
            await axios.post('/properties', newProperty, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Property created successfully!');
            setNewProperty({ title: '', description: '', price: '', location: '', property_type: 'Apartment' });
            fetchProperties();
        } catch (error) {
            setError('Error creating property');
        }
    };

    // Update an existing property
    const handleUpdateProperty = async (event) => {
        event.preventDefault();
        try {
            await axios.put(`/properties/${updateProperty.id}`, updateProperty, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Property updated successfully!');
            setUpdateProperty(null);
            fetchProperties();
        } catch (error) {
            setError('Error updating property');
        }
    };

    // Delete a property
    const handleDeleteProperty = async (id) => {
        try {
            await axios.delete(`/properties/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Property deleted successfully!');
            fetchProperties();
            fetchAgentApplications();
        } catch (error) {
            setError('Error deleting property');
        }
    };

    // Approve an application and update its status in the frontend
    const handleApproveApplication = async (applicationId) => {
        try {
            await axios.put(`/applications/${applicationId}/accept`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Application approved successfully!');
            setApplications(prevApplications =>
                prevApplications.map(app =>
                    app.id === applicationId ? { ...app, status: 'approved' } : app
                )
            );
        } catch (error) {
            setError('Error approving application');
        }
    };

    // Reject an application and update its status in the frontend
    const handleRejectApplication = async (applicationId) => {
        try {
            await axios.put(`/applications/${applicationId}/reject`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Application rejected successfully!');
            setApplications(prevApplications =>
                prevApplications.map(app =>
                    app.id === applicationId ? { ...app, status: 'rejected' } : app
                )
            );
        } catch (error) {
            setError('Error rejecting application');
        }
    };

    // Render applications based on their status
    const renderApplicationsByStatus = (status) => {
        return applications.filter(application => application.status === status).length > 0 ? (
            applications
                .filter(application => application.status === status)
                .map(application => (
                    <li key={application.id} className="application-item">
                        <p>Application ID: {application.id}</p>
                        <p>Property ID: {application.property_id}</p>
                        <p>Applicant User ID: {application.user_id}</p> {/* Display applicant's user ID */}
                        <p>Status: {application.status}</p>
                        <div className="action-buttons">
                            <button className="approve-button" onClick={() => handleApproveApplication(application.id)} disabled={status !== 'pending'}>
                                Approve
                            </button>
                            <button className="reject-button" onClick={() => handleRejectApplication(application.id)} disabled={status !== 'pending'}>
                                Reject
                            </button>
                        </div>
                    </li>
                ))
        ) : (
            <p>No {status} applications</p>
        );
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token from localStorage
        navigate('/login'); // Redirect to the login page
    };

    return (
        <div className="container">
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <h2>Agent Properties</h2>
    <button className="logout" onClick={handleLogout}>Logout</button>
</div>
{error && <p className="error">{error}</p>}
{success && <p className="success">{success}</p>}
            {/* Create Property Form */}
            <form className="property-form" onSubmit={handleCreateProperty}>
                <input
                    type="text"
                    placeholder="Title"
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                    required
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newProperty.description}
                    onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                    required
                    className="input-field"
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                    required
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={newProperty.location}
                    onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
                    required
                    className="input-field"
                />
                {/* Property Type Dropdown */}
                <select
                    value={newProperty.property_type}
                    onChange={(e) => setNewProperty({ ...newProperty, property_type: e.target.value })}
                    required
                    className="input-field"
                >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Room">Unit</option>
                </select>
                <button type="submit" className="submit-button">Create Property</button>
            </form>

            {updateProperty && (
                <form className="property-form" onSubmit={handleUpdateProperty}>
                    <h3>Update Property</h3>
                    <input
                        type="text"
                        placeholder="Title"
                        value={updateProperty.title}
                        onChange={(e) => setUpdateProperty({ ...updateProperty, title: e.target.value })}
                        required
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={updateProperty.description}
                        onChange={(e) => setUpdateProperty({ ...updateProperty, description: e.target.value })}
                        required
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={updateProperty.price}
                        onChange={(e) => setUpdateProperty({ ...updateProperty, price: e.target.value })}
                        required
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="Location"
                        value={updateProperty.location}
                        onChange={(e) => setUpdateProperty({ ...updateProperty, location: e.target.value })}
                        required
                        className="input-field"
                    />
                    {/* Property Type Dropdown */}
                    <select
                        value={updateProperty.property_type}
                        onChange={(e) => setUpdateProperty({ ...updateProperty, property_type: e.target.value })}
                        required
                        className="input-field"
                    >
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Room">Unit</option>
                    </select>
                    <button type="submit" className="submit-button">Update Property</button>
                    <button type="button" className="cancel-button" onClick={() => setUpdateProperty(null)}>Cancel</button>
                </form>
            )}

            {/* List properties */}
            <ul className="properties-list">
                {properties.length > 0 ? (
                    properties.map(property => (
                        <li key={property.id} className="property-card">
                            {/* Dynamic Image Based on Property Type */}
                            <img src={getImageForPropertyType(property.property_type)} alt={property.property_type} className="property-image" />

               
                            <h3>Title: {property.title}</h3>
                            <p>Description: {property.description}</p>
                            <p>Price: {property.price}</p>
                            <p>Location: {property.location}</p>
                            <p>Type: {property.property_type}</p>

                            <div className="action-buttons">
                                <button className="edit-button" onClick={() => setUpdateProperty(property)}>Edit</button>
                                <button className="delete-button" onClick={() => handleDeleteProperty(property.id)}>Delete</button>
                            </div>
                        </li>
                    ))
                ) : (
                    <p>No properties available</p>
                )}
            </ul>

            {/* Application Tabs */}
            <div className="applications-section">
                <h2>Applications</h2>
                <div className="application-tabs">
                    <button className="tab-button" onClick={() => setView('pending')}>Pending Applications</button>
                    <button className="tab-button" onClick={() => setView('approved')}>Approved Applications</button>
                    <button className="tab-button" onClick={() => setView('rejected')}>Rejected Applications</button>
                </div>

                {/* Render applications based on the active tab */}
                {view === 'pending' && (
                    <div>
                        <h3>Pending Applications</h3>
                        <ul>{renderApplicationsByStatus('pending')}</ul>
                    </div>
                )}
                {view === 'approved' && (
                    <div>
                        <h3>Approved Applications</h3>
                        <ul>{renderApplicationsByStatus('approved')}</ul>
                    </div>
                )}
                {view === 'rejected' && (
                    <div>
                        <h3>Rejected Applications</h3>
                        <ul>{renderApplicationsByStatus('rejected')}</ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertiesAgent;
