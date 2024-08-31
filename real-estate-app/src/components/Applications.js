// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Applications = () => {
//     const [applications, setApplications] = useState([]);
//     const [properties, setProperties] = useState([]); // State to store properties
//     const [propertyId, setPropertyId] = useState('');
//     const [submittedPropertyId, setSubmittedPropertyId] = useState('');
//     const [error, setError] = useState('');

//     useEffect(() => {
//         fetchApplications();
//         fetchProperties(); // Fetch properties when component mounts
//     }, []);

//     const fetchApplications = async () => {
//         try {
//             const response = await axios.get('/applications/agent', {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });
//             console.log('Applications fetched:', response.data);
//             setApplications(response.data);
//         } catch (error) {
//             setError('Error fetching applications');
//         }
//     };

//     const fetchProperties = async () => {
//         try {
//             const response = await axios.get('/properties', {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });
//             console.log('Fetched properties:', response.data);
//             setProperties(response.data);
//         } catch (error) {
//             setError('Error fetching properties');
//         }
//     };

//     const handleSubmitApplication = async (event) => {
//         event.preventDefault();
//         try {
//             const response = await axios.post('/applications', { property_id: propertyId }, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });
//             console.log('Application submitted:', response.data);
//             setSubmittedPropertyId(propertyId);
//             setPropertyId('');
//             fetchApplications();
//         } catch (error) {
//             setError('Error submitting application');
//         }
//     };

//     const handleUpdateApplication = async (id, status) => {
//         try {
//             await axios.put(`/applications/${id}`, { status }, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });
//             fetchApplications();
//         } catch (error) {
//             setError('Error updating application status');
//         }
//     };

//     // Function to get the property details by ID
//     const getPropertyDetailsById = (id) => {
//         return properties.find(property => property.id === id);
//     };

//     return (
//         <div>
//             <h2>Applications</h2>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             <form onSubmit={handleSubmitApplication}>
//                 <input
//                     type="text"
//                     placeholder="Property ID"
//                     value={propertyId}
//                     onChange={(e) => setPropertyId(e.target.value)}
//                     required
//                 />
//                 <button type="submit">Submit Application</button>
//             </form>
//             {submittedPropertyId && <p>Submitted Property ID: {submittedPropertyId}</p>}
//             <ul>
//                 {applications.length > 0 ? (
//                     applications.map(application => {
//                         const property = getPropertyDetailsById(application.property_id);
//                         return (
//                             <li key={application.id}>
//                                 <p>Property ID: {application.property_id}</p>
//                                 {property ? (
//                                     <div>
//                                         <p>Title: {property.title}</p>
//                                         <p>Description: {property.description}</p>
//                                         <p>Price: {property.price}</p>
//                                         <p>Location: {property.location}</p>
//                                     </div>
//                                 ) : (
//                                     <p>No such property found.</p>
//                                 )}
//                                 <p>Status: {application.status || 'No Status'}</p>
//                                 <button onClick={() => handleUpdateApplication(application.id, 'approved')}>Approve</button>
//                                 <button onClick={() => handleUpdateApplication(application.id, 'rejected')}>Reject</button>
//                             </li>
//                         );
//                     })
//                 ) : (
//                     <p>No applications available.</p>
//                 )}
//             </ul>
//         </div>
//     );
// };

// export default Applications;


import React from 'react';

const Applications = () => {
    return (
        <div>
            <h2>Feature Coming Soon</h2>
        </div>
    );
};

export default Applications;
