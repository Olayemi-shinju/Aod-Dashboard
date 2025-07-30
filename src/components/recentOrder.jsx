import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RecentOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const get = JSON.parse(localStorage.getItem('user'));
    const token = get?.value?.token;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${VITE_API_BASE_URL}/get-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.success) {
                    const recent = res.data.data
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5);
                    setOrders(recent);
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="text-gray-600">Loading recent orders...</div>;
    }

    return (
        <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map(order => {
                            const total = order.products.reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                            );

                            return (
                                <tr key={order._id} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {order.user?.name || 'Unknown User'}
                                    </td>

                                    {/* New Products Column */}
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        <ul className="list-disc ml-4 space-y-1">
                                            {order.products.map((p, idx) => (
                                                <li key={idx}>
                                                    {p.product?.name || 'Unnamed Product'} x {p.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>


                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        ₦{total.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : order.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : order.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            );
                        })}
                        {orders.length === 0 && (
                            <tr>
                                <td className="px-6 py-4 text-sm text-gray-500" colSpan="5">
                                    No recent orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default RecentOrders;
