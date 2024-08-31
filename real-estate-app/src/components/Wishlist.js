// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Wishlist = ({ property }) => {
//     const [wishlist, setWishlist] = useState(property.isInWishlist || false);

//     useEffect(() => {
//         setWishlist(property.isInWishlist || false);
//     }, [property.isInWishlist]);

//     const toggleWishlist = async () => {
//         try {
//             const method = wishlist ? 'DELETE' : 'POST';
//             await axios({
//                 method,
//                 url: '/wishlist',
//                 data: { property_id: property.id },
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });
//             setWishlist(!wishlist);
//         } catch (error) {
//             console.error('Error updating wishlist');
//         }
//     };

//     return (
//         <div>
//             <h3>{property.title}</h3>
//             <p>{property.description}</p>
//             <button onClick={toggleWishlist}>
//                 {wishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
//             </button>
//         </div>
//     );
// };

// export default Wishlist;


import React from 'react';

const Wishlist = () => {
    return (
        <div>
            <h2>Feature Coming Soon</h2>
        </div>
    );
};

export default Wishlist;
