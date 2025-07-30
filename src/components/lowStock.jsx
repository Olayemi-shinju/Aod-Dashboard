import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const LowStockDashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stockThreshold, setStockThreshold] = useState(5);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const resp = await axios.get(`${VITE_API_BASE_URL}/get-all-product`);
                if (resp.data.success) {
                    setProducts(resp.data.data);
                } else {
                    toast.error("Failed to fetch product data.");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Error fetching products. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const lowStockItems = useMemo(() => {
        return products.filter(p => p.quantity <= stockThreshold);
    }, [products, stockThreshold]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Low Stock Dashboard</h1>
                    <p className="text-gray-600">Only showing products below stock threshold</p>
                </div>

                <div className="flex items-center gap-4">
                    <label htmlFor="threshold" className="text-sm font-medium text-gray-700">
                        Threshold:
                    </label>
                    <input
                        type="number"
                        id="threshold"
                        min="1"
                        value={stockThreshold}
                        onChange={(e) => {
                            const newThreshold = parseInt(e.target.value) || 1;
                            setStockThreshold(newThreshold);
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-sm text-red-600 font-semibold">
                        Low Stock: {lowStockItems.length}
                    </span>
                </div>
            </div>

            {lowStockItems.length === 0 ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                    <p className="text-green-800 font-medium">No low stock items (threshold: {stockThreshold})</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {lowStockItems.map(product => {
                                let stockClass = 'text-yellow-500';
                                if (product.quantity === 0) {
                                    stockClass = 'text-red-700';
                                } else if (product.quantity <= 2) {
                                    stockClass = 'text-orange-500';
                                }

                                return (
                                    <tr key={product._id} className="hover:bg-gray-50 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    src={product.images[0]}
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                                                        e.target.className = 'h-10 w-10 rounded-md bg-gray-200';
                                                    }}
                                                    alt={product.name}
                                                    className="h-10 w-10 rounded-md object-cover"
                                                />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">{product.brand}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {product.category?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            ${product.price?.toLocaleString()}
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-semibold ${stockClass}`}>
                                            {product.quantity} left
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LowStockDashboard;
