import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PropertyAgent.css';

const PropertiesAgent = () => {
    const [properties, setProperties] = useState([]);
    const [applications, setApplications] = useState([]);
    const [users, setUsers] = useState([]); // Store user details
    const [newProperty, setNewProperty] = useState({ title: '', description: '', price: '', location: '', property_type: 'Apartment' });
    const [updateProperty, setUpdateProperty] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [view, setView] = useState('properties'); 
    const [appView, setAppView] = useState('pending'); 
    const navigate = useNavigate();

    useEffect(() => {
        fetchProperties();
        fetchAgentApplications();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await axios.get('/properties', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProperties(response.data || []);
        } catch (error) {
            setError('Error fetching properties');
        }
    };

    const fetchAgentApplications = async () => {
        try {
            const response = await axios.get('/agent/applications', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setApplications(response.data || []);
        } catch (error) {
            setError('Error fetching applications');
        }
    };

    const validatePrice = (price) => {
        return price > 0;
    };

    const handleCreateProperty = async (event) => {
        event.preventDefault();
        if (!validatePrice(newProperty.price)) {
            setError('Price must be greater than 0');
            return;
        }

        try {
            await axios.post('/properties', newProperty, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Property created successfully!');
            setNewProperty({ title: '', description: '', price: '', location: '', property_type: 'Apartment' });
            setShowCreateForm(false);
            fetchProperties();
        } catch (error) {
            setError('Error creating property');
        }
    };

    const handleUpdateProperty = async (event) => {
        event.preventDefault();
        if (!validatePrice(updateProperty.price)) {
            setError('Price must be greater than 0');
            return;
        }

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

    const handleDeleteProperty = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this property? Click Okay to Delete');
        if (confirmDelete) {
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
        } else {
            setSuccess('Property deletion canceled.');
        }
    };

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

    const renderApplicationsByStatus = (status) => {
        return applications.filter(application => application.status === status).length > 0 ? (
            applications
                .filter(application => application.status === status)
                .map(application => {
                    const property = properties.find(p => p.id === application.property_id); // Find the property associated with the application
                    return (
                        <li key={application.id} className="application-item">
                            <p>Application ID: {application.id}</p>
                            <p>Status: {application.status}</p>
                            <p>Date Submitted: {new Date(application.date_submitted).toLocaleDateString()}</p>
                            {property ? (
                                <>
                                    <h3>Property Details</h3>
                                    <img
                                        src={getImageForPropertyType(property.property_type)}
                                        alt={property.property_type}
                                        className="property-image"
                                    />
                                    <p>Property Title: {property.title}</p>
                                    <p>Property Description: {property.description}</p>
                                    <p>Price: {property.price}</p>
                                    <p>Location: {property.location}</p>
                                    <p>Type: {property.property_type}</p>
                                </>
                            ) : (
                                <p>Property details not available</p>
                            )}
                            <h3>Buyer Details</h3>
                            <p>Buyer Name: {application.buyer_name}</p>
                            <p>Buyer Email: {application.buyer_email}</p> {/* Displaying the buyer's email */}
                            <div className="action-buttons">
                                <button className="approve-button" onClick={() => handleApproveApplication(application.id)} disabled={status !== 'pending'}>
                                    Approve
                                </button>
                                <button className="reject-button" onClick={() => handleRejectApplication(application.id)} disabled={status !== 'pending'}>
                                    Reject
                                </button>
                            </div>
                        </li>
                    );
                })
        ) : (
            <p>No {status} applications</p>
        );
    };

    const toggleCreateForm = () => {
        setShowCreateForm(!showCreateForm);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getImageForPropertyType = (propertyType) => {
        switch (propertyType) {
            case 'Apartment':
                return 'https://media.self.com/photos/630635c30b7f36ce816f374a/4:3/w_1920,c_limit/DAB03919-10470989.jpg';  
            case 'House':
                return 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';  
            case 'Room':
                return 'https://media.istockphoto.com/id/1467126728/photo/modern-scandinavian-and-japandi-style-bedroom-interior-design-with-bed-white-color-wooden.jpg?s=2048x2048&w=is&k=20&c=rH-g41fAFCZgBzStL9TayRqcxhkovnYEMb3yHXEIlvU=';  
            default:
                return 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'; 
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
    <div className="container">
        <div className="navbar">
            <button className={view === 'properties' ? 'active' : ''} onClick={() => setView('properties')}>Properties</button>
            <button className={view === 'applications' ? 'active' : ''} onClick={() => setView('applications')}>Applications</button>
            <button className="logout" onClick={handleLogout}>Logout</button>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {view === 'properties' && (
            <div>
                <h2>Agent Properties</h2>
                <button className="create-button" onClick={toggleCreateForm}>
                    {showCreateForm ? 'Hide Create Property Form' : 'Create Property'}
                </button>

                {showCreateForm && (
                    <form className="property-form" onSubmit={handleCreateProperty}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newProperty.title}
                            onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                            required
                            className="input-field"
                        />
                        <textarea
                            placeholder="Description"
                            value={newProperty.description}
                            onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                            required
                            className="input-field"
                            rows="5"
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={newProperty.price}
                            onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                            required
                            className="input-field"
                            min="1"
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            value={newProperty.location}
                            onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
                            required
                            className="input-field"
                        />
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
                )}

                <ul className="properties-list">
                    {properties.length > 0 ? (
                        properties.map(property => (
                            <li key={property.id} className="property-card">
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

                                {/* Conditionally render the edit form only for the selected property */}
                                {updateProperty && updateProperty.id === property.id && (
                                    <div>
                                        <h2>Edit Property</h2>
                                        <form className="property-form" onSubmit={handleUpdateProperty}>
                                            <input
                                                type="text"
                                                placeholder="Title"
                                                value={updateProperty.title}
                                                onChange={(e) => setUpdateProperty({ ...updateProperty, title: e.target.value })}
                                                required
                                                className="input-field"
                                            />
                                            <textarea
                                                placeholder="Description"
                                                value={updateProperty.description}
                                                onChange={(e) => setUpdateProperty({ ...updateProperty, description: e.target.value })}
                                                required
                                                className="input-field"
                                                rows="5"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={updateProperty.price}
                                                onChange={(e) => setUpdateProperty({ ...updateProperty, price: e.target.value })}
                                                required
                                                className="input-field"
                                                min="1"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Location"
                                                value={updateProperty.location}
                                                onChange={(e) => setUpdateProperty({ ...updateProperty, location: e.target.value })}
                                                required
                                                className="input-field"
                                            />
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
                                        </form>
                                    </div>
                                )}
                            </li>
                        ))
                    ) : (
                        <p>No properties available</p>
                    )}
                </ul>
            </div>
        )}

        {view === 'applications' && (
            <div className="applications-section">
                <h2>Applications</h2>
                <div className="application-tabs">
                    <button className={appView === 'pending' ? 'active' : ''} onClick={() => setAppView('pending')}>Pending</button>
                    <button className={appView === 'approved' ? 'active' : ''} onClick={() => setAppView('approved')}>Approved</button>
                    <button className={appView === 'rejected' ? 'active' : ''} onClick={() => setAppView('rejected')}>Rejected</button>
                </div>

                {appView === 'pending' && (
                    <div>
                        <h3>Pending Applications</h3>
                        <ul>{renderApplicationsByStatus('pending')}</ul>
                    </div>
                )}
                {appView === 'approved' && (
                    <div>
                        <h3>Approved Applications</h3>
                        <ul>{renderApplicationsByStatus('approved')}</ul>
                    </div>
                )}
                {appView === 'rejected' && (
                    <div>
                        <h3>Rejected Applications</h3>
                        <ul>{renderApplicationsByStatus('rejected')}</ul>
                    </div>
                )}
            </div>
        )}

        {/* Scroll to Top button */}
        <button className="scroll-top-button" onClick={scrollToTop}>Scroll to Top</button>
    </div>
);

};

export default PropertiesAgent;
