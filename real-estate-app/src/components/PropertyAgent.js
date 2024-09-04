import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertiesAgent = () => {
    const [properties, setProperties] = useState([]); // Initialize as an empty array
    const [applications, setApplications] = useState([]); // Store all applications
    const [newProperty, setNewProperty] = useState({ title: '', description: '', price: '', location: '' });
    const [updateProperty, setUpdateProperty] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProperties();
        fetchAllApplications(); // Fetch all applications
    }, []);

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

    // Fetch all applications for the agent
    const fetchAllApplications = async () => {
        try {
            const response = await axios.get('/applications', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setApplications(response.data || []); // Ensure applications is always an array
        } catch (error) {
            setError('Error fetching applications');
        }
    };

    const handleCreateProperty = async (event) => {
        event.preventDefault();
        try {
            await axios.post('/properties', newProperty, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Property created successfully!');
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
            setSuccess('Property updated successfully!');
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
            setSuccess('Property deleted successfully!');
            fetchProperties();
        } catch (error) {
            setError('Error deleting property');
        }
    };

    const handleApproveApplication = async (applicationId) => {
        try {
            await axios.put(`/applications/${applicationId}`, { status: 'approved' }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Application approved successfully!');
            fetchProperties();
            fetchAllApplications(); // Update applications after approval
        } catch (error) {
            setError('Error approving application');
        }
    };

    const handleRejectApplication = async (applicationId) => {
        try {
            await axios.put(`/applications/${applicationId}`, { status: 'rejected' }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSuccess('Application rejected successfully!');
            fetchProperties();
            fetchAllApplications(); // Update applications after rejection
        } catch (error) {
            setError('Error rejecting application');
        }
    };

    return (
        <div>
            <h2>Agent Properties</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

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

            {/* List properties and their applications */}
            <ul>
                {properties.length > 0 ? (
                    properties.map(property => (
                        <li key={property.id}>
                            <h3>{property.title}</h3>
                            <p>{property.description}</p>
                            <p>Price: {property.price}</p>
                            <p>Location: {property.location}</p>

                            <button onClick={() => setUpdateProperty(property)}>Edit</button>
                            <button onClick={() => handleDeleteProperty(property.id)}>Delete</button>

                            <h4>Applications for this Property</h4>
                            <ul>
                                {property.applications && property.applications.length > 0 ? (
                                    property.applications.map(application => (
                                        <li key={application.id}>
                                            <p>Application ID: {application.id}</p>
                                            <p>Status: {application.status}</p>
                                            <button onClick={() => handleApproveApplication(application.id)}>Approve</button>
                                            <button onClick={() => handleRejectApplication(application.id)}>Reject</button>
                                        </li>
                                    ))
                                ) : (
                                    <p>No applications available</p>
                                )}
                            </ul>
                        </li>
                    ))
                ) : (
                    <p>No properties available</p>
                )}
            </ul>

            {/* Display all applications */}
            <h2>All Applications</h2>
            <ul>
                {applications.length > 0 ? (
                    applications.map(application => (
                        <li key={application.id}>
                            <p>Application ID: {application.id}</p>
                            <p>Property ID: {application.property_id}</p>
                            <p>Status: {application.status}</p>
                            <button onClick={() => handleApproveApplication(application.id)}>Approve</button>
                            <button onClick={() => handleRejectApplication(application.id)}>Reject</button>
                        </li>
                    ))
                ) : (
                    <p>No applications available</p>
                )}
            </ul>
        </div>
    );
};

export default PropertiesAgent;
