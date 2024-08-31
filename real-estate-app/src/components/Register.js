import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('buyer');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Changed to 'navigate'

    const handleRegister = async (event) => {
        event.preventDefault();
        try {
            await axios.post('/register', { username, email, password, role });
            console.log("Registration successful. Redirecting to login...");
            navigate('/login'); // Navigate after successful registration
        } catch (error) {
            console.error('Registration Error:', error.response?.data || error.message); // Log the error details
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="property_owner">Property Owner</option>
                </select>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
