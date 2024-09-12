import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './logo.jpg';  // Importing logo from the local directory

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('buyer'); // Default role is 'buyer'
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.backgroundColor = '#ffffff'; // Sets the background color to white
    }, []);

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
        <div style={{ textAlign: 'center' }}>
            <img src={logo} alt="Logo" style={{ width: '200px', margin: '20px 0' }} />
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
                <label>Select Role:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="buyer">Buyer</option>
                    <option value="agent">Agent</option>
                </select>
                <div style={{ margin: '20px 0' }}> {/* Button container for better spacing */}
                    <button type="submit">Register</button>
                </div>
            </form>
        </div>
    );
};

export default Register;
