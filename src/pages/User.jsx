import { useContext, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { CartContext } from "../Contexts/Context";
import axios from "axios";
import { toast } from "react-toastify";

export default function User({ isSidebarOpen }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const { data } = useContext(CartContext);
    const get = JSON.parse(localStorage.getItem("user"));
    const token = get?.value?.token;
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const resp = await axios.get(`${VITE_API_BASE_URL}/get-all-user`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(resp.data.success ? resp.data.data : []);
            } catch (error) {
                console.log(error);
            }
        };

        fetchUser();
    }, []);

    const confirmDelete = async () => {
        if (!selectedUserId) return;

        setLoadingDelete(true);
        try {
            const resp = await axios.delete(`${VITE_API_BASE_URL}/delete-user/${selectedUserId}`);
            if (resp.data.success === true) {
                setUsers(resp.data.data);
                toast.info(resp.data.msg);
                setConfirmDeleteOpen(false);
                setSelectedUserId(null);
            }
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'An error occurred');
        } finally {
            setLoadingDelete(false);
        }
    };

    const openDeleteModal = (id) => {
        setSelectedUserId(id);
        setConfirmDeleteOpen(true);
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
                                    <tr key={user._id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3">{user.name}</td>
                                        <td className="px-4 py-3">{user.email}</td>
                                        <td className="px-4 py-3">{user.phone}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button
                                                onClick={() => openDeleteModal(user._id)}
                                                className="text-red-500 cursor-pointer hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center text-sm py-4 text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {confirmDeleteOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => setConfirmDeleteOpen(false)}
                    ></div>
                    <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-80 max-w-full">
                        <p className="mb-4 text-center text-gray-700">Are you sure you want to delete this user?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setConfirmDeleteOpen(false)}
                                className="px-4 py-2 cursor-pointer rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                                disabled={loadingDelete}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded cursor-pointer bg-red-500 hover:bg-red-600 text-white"
                                disabled={loadingDelete}
                            >
                                {loadingDelete ? "Deleting..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
