import { useContext, useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CreateCategoryModal from "../Modal/CreateCategory";
import EditCategory from "../Modal/EditCategory";
import { CartContext } from "../Contexts/Context";
import axios from "axios";

export default function Categories({ isSidebarOpen }) {
    const [categories, setCategories] = useState([]);
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { data } = useContext(CartContext);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);
                const resp = await axios.get('http://localhost:7000/api/v1/get-category');
                setLoading(false);
                if (resp.data.success) {
                    setCategories(resp.data.data);
                } else {
                    setCategories([]);
                }
            } catch (error) {
                setLoading(false);
                console.log(error);
            }
        };

        fetchCategory();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        const updateOnlineStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOnlineStatus);
        updateOnlineStatus();

        return () => {
            clearTimeout(timer);
            window.removeEventListener("online", updateOnlineStatus);
            window.removeEventListener("offline", updateOnlineStatus);
        };
    }, []);

    const openModal = () => setOpen(true);
    const closeModal = () => setOpen(false);
    const closeEditModal = () => {
        setSelectedCategory(null);
        setEditModalOpen(false);
    };

    const handleDelete = (id) => {
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
        // Add axios delete call here if needed
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setEditModalOpen(true);
    };

    if (!isOnline) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6">
                <p className="text-lg font-semibold text-red-500 mb-2">You’re offline</p>
                <p className="text-sm text-gray-500">Please check your internet connection.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={`transition-all duration-300 ${isSidebarOpen ? '' : ''}`}>
            <div className="bg-white xl:flex mt-2 items-center justify-between p-6 shadow">
                <h1 className="text-sm font-bold">
                    Welcome back, <span className="text-sm">{data?.name}</span>
                </h1>
                <button onClick={openModal} className="p-3 cursor-pointer mt-2 bg-blue-400 text-white font-semibold text-sm rounded-md">
                    Create Category
                </button>
            </div>

            <div className="p-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Categories</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categories?.map((cat) => (
                            <motion.div
                                key={cat._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-md overflow-hidden relative group hover:shadow-lg transition-shadow"
                            >
                                <Link to='/products' className="block">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-40 object-contain bg-gray-50 transition-transform duration-200 group-hover:scale-105"
                                        onError={(e) =>
                                            (e.target.src = "https://via.placeholder.com/150?text=Image+Not+Found")
                                        }
                                    />
                                </Link>

                                <div className="p-2 flex justify-between items-center">
                                    <h3 className="text-base font-semibold text-gray-800 truncate">{cat.name}</h3>

                                    <div className="flex flex-col items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="text-gray-500 cursor-pointer hover:text-yellow-500 transition-colors"
                                            title="Edit"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat._id)}
                                            className="text-gray-500 hover:text-red-500 cursor-pointer transition-colors"
                                            title="Delete"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {categories.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 text-sm">
                                No categories found.
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {open && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"></div>
                    <CreateCategoryModal closeModal={closeModal} setCategories={setCategories} />
                </>
            )}

            {editModalOpen && selectedCategory && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"></div>
                    <EditCategory
                        closeModal={closeEditModal}
                        setCategories={setCategories}
                        category={selectedCategory}
                    />
                </>
            )}
        </div>
    );
}
