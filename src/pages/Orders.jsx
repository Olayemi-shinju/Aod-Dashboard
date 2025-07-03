import { useContext, useState } from "react";
import { CartContext } from "../Contexts/Context";

const initialOrders = [
    { id: 1001, customer: "John Doe", item: "MacBook Pro", date: "2025-06-17", amount: "$2000", status: "Completed" },
    { id: 1002, customer: "Jane Smith", item: "iPhone 15", date: "2025-06-18", amount: "$1100", status: "Pending" },
    { id: 1003, customer: "Ali Joker", item: "Xbox Series X", date: "2025-06-19", amount: "$500", status: "Completed" },
    { id: 1004, customer: "Emily Rose", item: "AirPods Max", date: "2025-06-15", amount: "$550", status: "Completed" },
     { id: 1004, customer: "Emily Rose", item: "AirPods Max", date: "2025-06-15", amount: "$550", status: "Completed" },
];

export default function Orders({ isSidebarOpen }) {
    const [orders, setOrders] = useState(initialOrders);
    const [filterDate, setFilterDate] = useState("");
      const {data, user } = useContext(CartContext)
    

 
    const handleDelete = (id) => {
        setOrders((prev) => prev.filter((order) => order.id !== id));
    };

    const filteredOrders = filterDate
        ? orders.filter((order) => order.date === filterDate)
        : orders;

    return (
        <div className={`transition-all duration-300 ${isSidebarOpen ? '' : ''}`}>
            {/* Top Header */}
            <div className="bg-white p-6 shadow">
                <h1 className="text-sm font-bold">
                    Welcome back, <span className="text-sm font-normal">{data?.name}</span>
                </h1>
            </div>

            {/* Orders Table */}
            <div className="p-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <h2 className="text-lg font-semibold">Order List</h2>
                        <div className="flex items-center gap-3">
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="border p-2 rounded text-sm"
                            />
                            <button
                                onClick={() => setFilterDate("")}
                                className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 transition"
                            >
                                Clear
                            </button>
                           
                        </div>
                    </div>

                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="min-w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="px-4 py-2">SN</th>
                                    <th className="px-4 py-2">Customer</th>
                                    <th className="px-4 py-2">Item</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Amount</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order, index) => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3">{order.customer}</td>
                                        <td className="px-4 py-3">{order.item}</td>
                                        <td className="px-4 py-3">{order.date}</td>
                                        <td className="px-4 py-3">{order.amount}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "Completed"
                                                    ? "bg-green-100 text-green-600"
                                                    : order.status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-600"
                                                        : "bg-red-100 text-red-600"
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 xl:flex items-center gap-2">
                                            {order.status !== "Completed" && (
                                                <select name="confirm" className="text-xs border rounded px-2 py-1">
                                                    <option value="">select</option>
                                                    <option value="Confirm">Confirm</option>
                                                </select>
                                            )}
                                            <button
                                                onClick={() => handleDelete(order.id)}
                                                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
