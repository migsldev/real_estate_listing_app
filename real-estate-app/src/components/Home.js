import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <h1>Welcome to Real Estate App</h1>
            <p>Your one-stop destination for all your real estate needs.</p>
            <div>
                <Link to="/register">
                    <button>Register as Property Owner</button>
                </Link>
                {/* Add more buttons for other navigations if needed */}
                <Link to="/login">
                    <button>Login</button>
                </Link>

            </div>
        </div>
    );
};

export default Home;
