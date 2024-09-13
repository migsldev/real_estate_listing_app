import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PropertyBuyer.css';

const PropertyBuyer = () => {
    const [properties, setProperties] = useState([]);
    const [applications, setApplications] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterType, setFilterType] = useState('');
    const [currentView, setCurrentView] = useState('properties'); // Track current view
    const navigate = useNavigate();

    useEffect(() => {
        fetchProperties();
        fetchApplications();
        fetchWishlist();
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const fetchProperties = async () => {
        try {
            const response = await axios.get('/properties', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProperties(response.data);
        } catch (error) {
            setError('Error fetching properties');
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await axios.get('/applications', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setApplications(response.data);
        } catch (error) {
            setError('Error fetching applications');
        }
    };

    const fetchWishlist = async () => {
        try {
            const response = await axios.get('/wishlist', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setWishlist(response.data);
        } catch (error) {
            setError('Error fetching wishlist');
        }
    };

    const handleApplyToProperty = async (propertyId) => {
        try {
            await axios.post('/applications', { property_id: propertyId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Application submitted');
            fetchApplications();
        } catch (error) {
            setError('Error applying to property');
        }
    };

    const handleCancelApplication = async (applicationId) => {
        try {
            await axios.delete(`/applications/${applicationId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Application canceled');
            fetchApplications();
        } catch (error) {
            setError('Error canceling application');
        }
    };

    const handleAddToWishlist = async (propertyId) => {
        try {
            await axios.post('/wishlist', { property_id: propertyId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Property added to wishlist');
            fetchWishlist();
        } catch (error) {
            setError('Error adding to wishlist');
        }
    };

    const handleRemoveFromWishlist = async (propertyId) => {
        try {
            await axios.delete('/wishlist', {
                data: { property_id: propertyId },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Property removed from wishlist');
            fetchWishlist();
        } catch (error) {
            setError('Error removing from wishlist');
        }
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

    const filteredProperties = properties.filter((property) => {
        const isApprovedOrRejected = applications.some(app => app.property_id === property.id && (app.status === 'approved' || app.status === 'rejected'));
        if (isApprovedOrRejected) return false;
        if (filterType && property.property_type !== filterType) return false;
        return true;
    });

    const hasApplied = (propertyId) => {
        return applications.some(application => application.property_id === propertyId);
    };

    const isInWishlist = (propertyId) => {
        return Array.isArray(wishlist) && wishlist.some(item => item.property_id === propertyId);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="container">
            <nav className="navbar">
                <button onClick={() => setCurrentView('properties')}>Properties</button>
                <button onClick={() => setCurrentView('applications')}>Applications</button>
                <button onClick={handleLogout}>Logout</button>
            </nav>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            {currentView === 'properties' && (
                <>
                    <div className="filter-section">
                        <label>Filter by Property Type:</label>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="">All</option>
                            <option value="Apartment">Apartment</option>
                            <option value="House">House</option>
                            <option value="Room">Unit</option>
                        </select>
                    </div>

                    <div className="properties-grid">
                        {filteredProperties.length > 0 ? (
                            filteredProperties.map((property) => (
                                <div className="property-card" key={property.id}>
                                    <img src={getImageForPropertyType(property.property_type)} alt={property.property_type} className="property-image" />
                                    <div className="card-content">
                                        <h3>{property.title}</h3>
                                        <p>{property.description}</p>
                                        <p>Type: {property.property_type}</p>
                                        <p className="price">Price: {property.price}</p>

                                        {hasApplied(property.id) ? (
                                            <button
                                                className="cancel-button"
                                                onClick={() => {
                                                    const app = applications.find(app => app.property_id === property.id);
                                                    handleCancelApplication(app.id);
                                                }}
                                            >
                                                Cancel Application
                                            </button>
                                        ) : (
                                            <button
                                                className="apply-button"
                                                onClick={() => handleApplyToProperty(property.id)}
                                            >
                                                Apply to Property
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No properties available</p>
                        )}
                    </div>
                </>
            )}

{currentView === 'applications' && (
    <div className="applications-list">
        <h2>Your Applications</h2>
        <ul>
            {applications.length > 0 ? (
                applications.map((application) => {
                    const property = properties.find(p => p.id === application.property_id); // Find the property associated with the application
                    const getStatusColor = (status) => {
                        switch (status) {
                            case 'approved':
                                return 'green';
                            case 'rejected':
                                return 'red';
                            default:
                                return 'black'; // For 'pending' or other statuses
                        }
                    };

                    return (
                        <li key={application.id} className="application-item">
                            <p>Application ID: {application.id}</p>
                            <p
                                style={{ color: getStatusColor(application.status) }} // Apply the color based on status
                            >
                                Status: {application.status}
                            </p>
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
                                    <p>Type: {property.property_type}</p>
                                    <p>Price: {property.price}</p>
                                    <p>Location: {property.location}</p>

                                    <h4>Agent Details</h4>
                                    <p>Agent Name: {property.agent_name}</p>
                                    <p>Agent Email: {property.agent_email}</p>
                                </>
                            ) : (
                                <p>Property details not available</p>
                            )}
                        </li>
                    );
                })
            ) : (
                <p>No applications found</p>
            )}
        </ul>
    </div>
)}


            <button className="back-to-top" onClick={scrollToTop}>Back to Top</button>
        </div>
    );
};

export default PropertyBuyer;
