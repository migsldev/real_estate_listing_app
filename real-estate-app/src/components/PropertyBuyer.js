import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertyBuyer = () => {
    const [properties, setProperties] = useState([]);
    const [applications, setApplications] = useState([]); // State to store applications
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProperties();
        fetchApplications(); // Fetch applications when the component mounts
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
            setApplications(response.data); // Store the applications data
        } catch (error) {
            setError('Error fetching applications');
        }
    };

    // Apply to property
    const handleApplyToProperty = async (propertyId) => {
        try {
            await axios.post('/applications', { property_id: propertyId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Application submitted');
            fetchApplications(); // Refresh applications after applying
        } catch (error) {
            setError('Error applying to property');
        }
    };

    // Cancel application to property
    const handleCancelApplication = async (applicationId) => {
        try {
            await axios.delete(`/applications/${applicationId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Application canceled');
            fetchApplications(); // Refresh applications after canceling
        } catch (error) {
            setError('Error canceling application');
        }
    };

    return (
        <div>
            <h2>Properties</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            {/* List all properties */}
            <ul>
                {properties.length > 0 ? (
                    properties.map((property) => (
                        <li key={property.id}>
                            <h3>{property.title}</h3>
                            <p>{property.description}</p>
                            <p>Price: {property.price}</p>

                            {/* Application buttons */}
                            <button onClick={() => handleApplyToProperty(property.id)}>
                                Apply to Property
                            </button>
                            <button onClick={() => handleCancelApplication(property.id)}>
                                Cancel Application
                            </button>
                        </li>
                    ))
                ) : (
                    <p>No properties available</p>
                )}
            </ul>

            {/* Section to display all applications */}
            <h2>Your Applications</h2>
            <ul>
                {applications.length > 0 ? (
                    applications.map((application) => (
                        <li key={application.id}>
                            <p>Application ID: {application.id}</p>
                            <p>Property ID: {application.property_id}</p>
                            <p>Status: {application.status}</p>
                            <p>Date Submitted: {new Date(application.date_submitted).toLocaleDateString()}</p>
                            {/* Optionally add more details here */}
                        </li>
                    ))
                ) : (
                    <p>No applications found</p>
                )}
            </ul>
        </div>
    );
};

export default PropertyBuyer;
