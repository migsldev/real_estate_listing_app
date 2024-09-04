import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/login', { email, password });

            // Assuming the backend returns a role as part of the response
            const { access_token, user_role } = response.data;

            // Store token and user role
            localStorage.setItem('token', access_token);
            localStorage.setItem('role', user_role);

            // Redirect based on user role
            if (user_role === 'agent') {
                navigate('/properties-agent');  // Redirect to agent's properties
            } else if (user_role === 'buyer') {
                navigate('/properties-buyer');  // Redirect to buyer's properties
            } else {
                setError('Invalid role');
            }
        } catch (error) {
            setError('Invalid credentials');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
