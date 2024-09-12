import { Link } from 'react-router-dom';
import logo from './logo.jpg';  // Importing logo from the local directory

import React, { useState, useEffect } from 'react';
const Home = () => {
    useEffect(() => {
        document.body.style.backgroundColor = '#ffffff';  // Sets the background color to white

        // Cleanup function to reset the background color when the component unmounts
        return () => {
            document.body.style.backgroundColor = '';  // Resets the background color
        };
    }, []);

    return (
        <div style={{ textAlign: 'center' }}>
            <img src={logo} alt="Logo" style={{ width: '300px', margin: '20px 0' }} />  

            <div>
                <Link to="/register">
                    <button>Register as Buyer/Agent</button>
                </Link>
                <Link to="/login">
                    <button>Login</button>
                </Link>
            </div>
        </div>
    );
};

export default Home;
