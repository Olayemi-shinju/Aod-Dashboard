// import { useEffect, useState } from "react";
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// const AdminWishlistPage = () => {
//   const [wishlists, setWishlists] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [mostWanted, setMostWanted] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const get = JSON.parse(localStorage.getItem("user"));
//   const token = get?.value?.token;

//   const fetchWishlists = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`${API_BASE}/wishlist/all`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setWishlists(data.data);
//       calculateMostWanted(data.data);
//     } catch (err) {
//       console.error("Failed to fetch wishlists", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateMostWanted = (data) => {
//     const productMap = {};
//     data.forEach(entry => {
//       entry.wishlist.forEach(w => {
//         const id = w.product._id;
//         productMap[id] = productMap[id]
//           ? { ...productMap[id], count: productMap[id].count + 1 }
//           : { product: w.product, count: 1 };
//       });
//     });

//     const sorted = Object.values(productMap).sort((a, b) => b.count - a.count);
//     setMostWanted(sorted.slice(0, 5));
//   };

//   useEffect(() => {
//     fetchWishlists();
//   }, []);

//   const openModal = (user) => {
//     setSelectedUser(user);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedUser(null);
//   };

//   return (
//     <div className="admin-wishlist-container">
//       <header className="admin-header">
//         <h1>Wishlist Dashboard</h1>
//         <p>Manage and view customer wishlists</p>
//       </header>

//       {loading ? (
//         <div className="loading-spinner">
//           <div className="spinner"></div>
//           <p>Loading wishlists...</p>
//         </div>
//       ) : (
//         <>
//           <section className="most-wanted-section">
//             <h2>Most Wanted Products</h2>
//             <div className="most-wanted-grid">
//               {mostWanted.map(({ product, count }, index) => (
//                 <div key={product._id} className="most-wanted-card">
//                   <span className="rank-badge">#{index + 1}</span>
//                   <h3>{product.name}</h3>
//                   <p className="wish-count">{count} {count === 1 ? 'wish' : 'wishes'}</p>
//                   <p className="price">₦{product.price.toLocaleString()}</p>
//                 </div>
//               ))}
//             </div>
//           </section>

//           <section className="user-wishlists-section">
//             <h2>User Wishlists</h2>
//             <div className="user-wishlists-grid">
//               {wishlists.map((entry) => (
//                 <div key={entry.user._id} className="user-card">
//                   <div className="user-info">
//                     <h3>{entry.user.name}</h3>
//                     <p>{entry.user.email}</p>
//                   </div>
//                   <div className="wishlist-count">
//                     <i className="fas fa-heart"></i>
//                     <span>{entry.wishlist.length} items</span>
//                   </div>
//                   <button 
//                     onClick={() => openModal(entry)}
//                     disabled={entry.wishlist.length === 0}
//                     className="view-button"
//                   >
//                     View Wishlist
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </>
//       )}

//       {showModal && selectedUser && (
//         <div className="modal-overlay" onClick={closeModal}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <button className="close-modal" onClick={closeModal}>
//               &times;
//             </button>
//             <h2>{selectedUser.user.name}'s Wishlist</h2>
            
//             {selectedUser.wishlist.length === 0 ? (
//               <div className="empty-wishlist">
//                 <i className="fas fa-heart-broken"></i>
//                 <p>No items in wishlist</p>
//               </div>
//             ) : (
//               <div className="wishlist-items">
//                 {selectedUser.wishlist.map((item) => (
//                   <div key={item._id} className="wishlist-item">
//                     <div className="item-info">
//                       <h3>{item.product.name}</h3>
//                       <p className="price">₦{item.product.price.toLocaleString()}</p>
//                     </div>
//                     <img
//                       src={item.product.images[0]}
//                       alt={item.product.name}
//                       className="product-image"
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         .admin-wishlist-container {
//           padding: 2rem;
//           font-family: 'Inter', sans-serif;
//           background-color: #f8fafc;
//           min-height: 100vh;
//         }
        
//         .admin-header {
//           margin-bottom: 2.5rem;
//         }
        
//         .admin-header h1 {
//           font-size: 2rem;
//           font-weight: 700;
//           color: #1e293b;
//           margin-bottom: 0.5rem;
//         }
        
//         .admin-header p {
//           color: #64748b;
//           font-size: 1rem;
//         }
        
//         .loading-spinner {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           min-height: 300px;
//         }
        
//         .spinner {
//           border: 4px solid rgba(0, 0, 0, 0.1);
//           border-radius: 50%;
//           border-top: 4px solid #3b82f6;
//           width: 40px;
//           height: 40px;
//           animation: spin 1s linear infinite;
//           margin-bottom: 1rem;
//         }
        
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         .most-wanted-section {
//           margin-bottom: 3rem;
//         }
        
//         .most-wanted-section h2 {
//           font-size: 1.5rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin-bottom: 1.5rem;
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }
        
//         .most-wanted-section h2::before {
//           content: "🔥";
//         }
        
//         .most-wanted-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
//           gap: 1.5rem;
//         }
        
//         .most-wanted-card {
//           background: white;
//           border-radius: 0.75rem;
//           padding: 1.5rem;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           position: relative;
//           transition: transform 0.2s, box-shadow 0.2s;
//         }
        
//         .most-wanted-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//         }
        
//         .rank-badge {
//           position: absolute;
//           top: -0.75rem;
//           left: -0.75rem;
//           background: #3b82f6;
//           color: white;
//           width: 2.5rem;
//           height: 2.5rem;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: bold;
//           font-size: 1.1rem;
//         }
        
//         .most-wanted-card h3 {
//           font-size: 1.1rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin-bottom: 0.5rem;
//         }
        
//         .wish-count {
//           color: #64748b;
//           font-size: 0.9rem;
//           margin-bottom: 0.5rem;
//         }
        
//         .price {
//           font-weight: 600;
//           color: #10b981;
//         }
        
//         .user-wishlists-section h2 {
//           font-size: 1.5rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin-bottom: 1.5rem;
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }
        
//         .user-wishlists-section h2::before {
//           content: "👥";
//         }
        
//         .user-wishlists-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
//           gap: 1.5rem;
//         }
        
//         .user-card {
//           background: white;
//           border-radius: 0.75rem;
//           padding: 1.5rem;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           transition: transform 0.2s, box-shadow 0.2s;
//         }
        
//         .user-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//         }
        
//         .user-info h3 {
//           font-size: 1.1rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin-bottom: 0.25rem;
//         }
        
//         .user-info p {
//           color: #64748b;
//           font-size: 0.9rem;
//           margin-bottom: 1rem;
//         }
        
//         .wishlist-count {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           color: #ef4444;
//           margin-bottom: 1.5rem;
//         }
        
//         .wishlist-count i {
//           font-size: 1.1rem;
//         }
        
//         .view-button {
//           width: 100%;
//           padding: 0.75rem;
//           background: #3b82f6;
//           color: white;
//           border: none;
//           border-radius: 0.5rem;
//           font-weight: 500;
//           cursor: pointer;
//           transition: background 0.2s;
//         }
        
//         .view-button:hover {
//           background: #2563eb;
//         }
        
//         .view-button:disabled {
//           background: #cbd5e1;
//           cursor: not-allowed;
//         }
        
//         .modal-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(0, 0, 0, 0.5);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 1000;
//         }
        
//         .modal-content {
//           background: white;
//           border-radius: 0.75rem;
//           padding: 2rem;
//           width: 90%;
//           max-width: 600px;
//           max-height: 80vh;
//           overflow-y: auto;
//           position: relative;
//           box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
//         }
        
//         .close-modal {
//           position: absolute;
//           top: 1rem;
//           right: 1rem;
//           background: none;
//           border: none;
//           font-size: 1.5rem;
//           cursor: pointer;
//           color: #64748b;
//         }
        
//         .modal-content h2 {
//           font-size: 1.5rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin-bottom: 1.5rem;
//           padding-right: 2rem;
//         }
        
//         .empty-wishlist {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 2rem;
//           color: #64748b;
//         }
        
//         .empty-wishlist i {
//           font-size: 2rem;
//           margin-bottom: 1rem;
//           color: #e2e8f0;
//         }
        
//         .wishlist-items {
//           display: flex;
//           flex-direction: column;
//           gap: 1rem;
//         }
        
//         .wishlist-item {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 1rem 0;
//           border-bottom: 1px solid #e2e8f0;
//         }
        
//         .item-info h3 {
//           font-size: 1rem;
//           font-weight: 600;
//           color: #1e293b;
//           margin-bottom: 0.25rem;
//         }
        
//         .price {
//           font-size: 0.9rem;
//           color: #64748b;
//         }
        
//         .product-image {
//           width: 60px;
//           height: 60px;
//           object-fit: cover;
//           border-radius: 0.5rem;
//           border: 1px solid #e2e8f0;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AdminWishlistPage;