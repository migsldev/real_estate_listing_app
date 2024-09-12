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
    const [showWishlist, setShowWishlist] = useState(false);
    const [filterType, setFilterType] = useState(''); // State for filtering properties
    const navigate = useNavigate();

    useEffect(() => {
        fetchProperties();
        fetchApplications();
        fetchWishlist();
    }, []);

    // Fetch all properties
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

    // Fetch all applications
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

    // Fetch wishlist
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

    // Apply to property
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

    // Cancel application
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

    // Add to wishlist
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

    // Remove from wishlist
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
            return 'https://media.self.com/photos/630635c30b7f36ce816f374a/4:3/w_1920,c_limit/DAB03919-10470989.jpg'; // Replace with your actual apartment image path
        case 'House':
            return 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'; // Replace with your actual house image path
        case 'Room':
            return 'https://media.istockphoto.com/id/1467126728/photo/modern-scandinavian-and-japandi-style-bedroom-interior-design-with-bed-white-color-wooden.jpg?s=2048x2048&w=is&k=20&c=rH-g41fAFCZgBzStL9TayRqcxhkovnYEMb3yHXEIlvU='; // Replace with your actual room image path
        default:
            return 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'; // Fallback image
    }
};

    // Filter properties based on selected type
    const filteredProperties = properties.filter((property) => {
        const isApprovedOrRejected = applications.some(app => app.property_id === property.id && (app.status === 'approved' || app.status === 'rejected'));
        if (isApprovedOrRejected) return false; // Exclude properties that are approved or rejected
        if (filterType && property.property_type !== filterType) return false; // Filter by selected property type
        return true;
    });

    // Helper function to check if user has applied to a property
    const hasApplied = (propertyId) => {
        return applications.some(application => application.property_id === propertyId);
    };

    // Helper function to check if property is in the wishlist
    const isInWishlist = (propertyId) => {
        return Array.isArray(wishlist) && wishlist.some(item => item.property_id === propertyId);
    };

    // Toggle wishlist visibility
    const toggleWishlist = () => {
        setShowWishlist(!showWishlist);
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
    <div className="container">
        <div className="header-container">
            <h2>Properties</h2>
            <button className="logout" onClick={handleLogout}>Logout</button>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {/* Filter Options */}
        <div className="filter-section">
            <label>Filter by Property Type:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">All</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Room">Unit</option>
            </select>
        </div>

        {/* List all properties */}
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

                            {/* Application buttons */}
                            {hasApplied(property.id) ? (
                                <button onClick={() => {
                                    const app = applications.find(app => app.property_id === property.id);
                                    handleCancelApplication(app.id);
                                }}>
                                    Cancel Application
                                </button>
                            ) : (
                                <button onClick={() => handleApplyToProperty(property.id)}>
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

        {/* Section to display all applications */}
        <div className="applications-list">
            <h2>Your Applications</h2>
            <ul>
                {applications.length > 0 ? (
                    applications.map((application) => (
                        <li key={application.id}>
                            <p>Application ID: {application.id}</p>
                            <p>Status: {application.status}</p>
                            <p>Date Submitted: {new Date(application.date_submitted).toLocaleDateString()}</p>
                        </li>
                    ))
                ) : (
                    <p>No applications found</p>
                )}
            </ul>
        </div>
    </div>
);

};

export default PropertyBuyer;
