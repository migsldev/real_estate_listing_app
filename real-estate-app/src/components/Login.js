import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './logo.jpg';  // Importing logo from the local directory

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.backgroundColor = '#ffffff';  // Sets the background color to white

        // Cleanup function to reset the background color when the component unmounts
        return () => {
            document.body.style.backgroundColor = '';  // Resets the background color
        };
    }, []);  // Empty dependency array ensures this effect runs only once after the initial render

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/login', { email, password });
            const { access_token, user_role } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', user_role);

            if (user_role === 'agent') {
                navigate('/properties-agent');
            } else if (user_role === 'buyer') {
                navigate('/properties-buyer');
            } else {
                setError('Invalid role');
            }
        } catch (error) {
            setError('Invalid credentials');
        }
    };

    const handleNavigateHome = () => {
        navigate('/register');  // Redirect to the registration page
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <img src={logo} alt="Logo" style={{ width: '200px', margin: '20px 0' }} />
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
                <div style={{ margin: '20px 0' }}> {/* Button container */}
                    <button type="submit" style={{ marginRight: '10px' }}>Login</button>
                    <button onClick={handleNavigateHome}>Home</button>
                </div>
            </form>
        </div>
    );
};

export default Login;
