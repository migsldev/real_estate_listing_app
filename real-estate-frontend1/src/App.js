import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Properties from './components/Properties';
import Applications from './components/Applications';
import Wishlist from './components/Wishlist'; // Import the Wishlist component
import NotFound from './components/NotFound';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/wishlist" element={<Wishlist />} /> {/* Add route for Wishlist */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
