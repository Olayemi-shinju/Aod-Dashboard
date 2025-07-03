import { useContext, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { CartContext } from "../Contexts/Context";

const initialUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: '09135611021' },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: '09135411021' },
    { id: 3, name: "Ali Joker", email: "ali@example.com", phone: '08135616021' },
    { id: 4, name: "Emily Rose", email: "emily@example.com", phone: '07035617021' },
];

export default function User({ isSidebarOpen }) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
      const { user, data } = useContext(CartContext)
    

    const handleDelete = (id) => {
        setUsers(users.filter(user => user.id !== id));
    };

    const handleEdit = (id) => {
        alert(`Edit user with ID ${id}`);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={`transition-all duration-300 ${isSidebarOpen ? '' : ''}`}>
            {/* Header */}
            <div className="bg-white flex justify-between p-6 shadow">
                <h1 className="text-sm mt-2 font-bold">
                    Welcome back, <span className="text-sm">{data?.name}</span>
                </h1>
             
            </div>

            {/* User Table */}
            <div className="p-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">User List</h2>
                        <div className="flex items-center border rounded-md px-2 py-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search user..."
                                className="outline-none p-1 text-sm"
                            />
                            <IoSearch className="text-gray-500 text-lg ml-1" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="px-4 py-2">SN</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Phone</th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3">{user.name}</td>
                                        <td className="px-4 py-3">{user.email}</td>
                                        <td className="px-4 py-3">{user.phone}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(user.id)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center text-sm py-4 text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
