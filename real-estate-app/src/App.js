import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Properties from './components/Properties';
import Applications from './components/Applications';
import Wishlist from './components/Wishlist'; // Import the Wishlist component
import NotFound from './components/NotFound';
import PropertyAgent from './components/PropertyAgent';
import PropertyBuyer from './components/PropertyBuyer';

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
				<Route path="/properties-agent" element={<PropertyAgent />} />
                <Route path="/properties-buyer" element={<PropertyBuyer />} />
            </Routes>
        </Router>
    );
}

export default App;
