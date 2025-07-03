import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CartContext } from "../Contexts/Context";
import CreateProductModal from "../Modal/createProduct";
import axios from "axios";
import { toast } from "react-toastify";
import { IoSearch } from "react-icons/io5";

export default function Products({ isSidebarOpen }) {
    const [products, setProducts] = useState([]);
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(true);
    const { data } = useContext(CartContext);
    const [loadedImages, setLoadedImages] = useState({});
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [productToggles, setProductToggles] = useState({});
    const [loadingToggles, setLoadingToggles] = useState({});
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [input, setInput] = useState("");


    const filterProduct = products.filter((products) =>
        products.name.toLowerCase().includes(input.toLowerCase()) || products.brand.toLowerCase().includes(input.toLowerCase())
    );


    // New states for Confirm Delete modal
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteProductId, setDeleteProductId] = useState(null);

    const openModal = () => setOpen(true);
    const closeModal = () => setOpen(false);

    const handleImageLoad = (id) => {
        setLoadedImages((prev) => ({ ...prev, [id]: true }));
    };

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);
                const resp = await axios.get("http://localhost:7000/api/v1/get-category");
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

    // Fetch products and initialize toggles
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const resp = await axios.get("http://localhost:7000/api/v1/get-all-product");
                setLoading(false);
                if (resp.data.success) {
                    setProducts(resp.data.data);
                    const togglesInit = {};
                    resp.data.data.forEach((p) => {
                        togglesInit[p._id] = {
                            trending: p.isTrending || false,
                            newArrival: p.isNewArrival || false,
                        };
                    });
                    setProductToggles(togglesInit);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                setLoading(false);
                console.log(error);
            }
        };

        fetchProduct();
    }, []);

    // Toggle Trending
    const toggleTrending = async (id) => {
        const currentValue = productToggles[id]?.trending;

        setLoadingToggles((prev) => ({
            ...prev,
            [id]: { ...prev[id], trending: true },
        }));

        try {
            const newValue = !currentValue;
            const resp = await axios.patch(`http://localhost:7000/api/v1/patch-product/${id}`, {
                isTrending: newValue,
            });

            if (resp.data.success) {
                setProductToggles((prev) => ({
                    ...prev,
                    [id]: {
                        ...prev[id],
                        trending: newValue,
                    },
                }));
            }
        } catch (error) {
            console.error("Failed to update trending:", error);
        } finally {
            setLoadingToggles((prev) => ({
                ...prev,
                [id]: { ...prev[id], trending: false },
            }));
        }
    };

    // Toggle New Arrival
    const toggleNewArrival = async (id) => {
        const currentValue = productToggles[id]?.newArrival;

        setLoadingToggles((prev) => ({
            ...prev,
            [id]: { ...prev[id], newArrival: true },
        }));

        try {
            const newValue = !currentValue;
            const resp = await axios.patch(`http://localhost:7000/api/v1/patch-product/${id}`, {
                isNewArrival: newValue,
            });

            if (resp.data.success) {
                setProductToggles((prev) => ({
                    ...prev,
                    [id]: {
                        ...prev[id],
                        newArrival: newValue,
                    },
                }));
            }
        } catch (error) {
            console.error("Failed to update newArrival:", error);
        } finally {
            setLoadingToggles((prev) => ({
                ...prev,
                [id]: { ...prev[id], newArrival: false },
            }));
        }
    };

    const handleEdit = (id) => {
        alert(`Edit product with id: ${id}`);
    };

    // Instead of deleting immediately, open confirm modal
    const handleDeleteClick = (id) => {
        setDeleteProductId(id);
        setConfirmDeleteOpen(true);
    };

    // Called after user confirms deletion in modal
    const confirmDelete = async () => {
        if (!deleteProductId) return;

        setLoadingDelete(true);
        try {
            const resp = await axios.delete(`http://localhost:7000/api/v1/delete-product/${deleteProductId}`);
            if (resp.data.success === true) {
                // Remove deleted product from products list
                setProducts((prev) => prev.filter((p) => p._id !== deleteProductId));
                toast.info(resp.data?.msg || "Product deleted successfully");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.response?.data?.msg || "An error occurred");
        } finally {
            setLoadingDelete(false);
            setDeleteProductId(null);
            setConfirmDeleteOpen(false);
        }
    };

    return (
        <div>
            <div className={`transition-all duration-300 ${isSidebarOpen ? "" : ""}`}>
                <div className="bg-white xl:flex items-center justify-between p-6 shadow">
                    <h1 className="text-sm mt-2 font-bold">
                        Welcome back, <span className="text-sm">{data?.name}</span>
                    </h1>
                    <div>
                        <button
                            onClick={openModal}
                            className="p-3 bg-blue-400 mt-2 text-white cursor-pointer font-semibold text-sm rounded-md"
                        >
                            Create Product
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {!isOnline ? (
                        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6">
                            <p className="text-lg font-semibold text-red-500 mb-2">You’re offline</p>
                            <p className="text-sm text-gray-500">Please check your internet connection.</p>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div>
                            <div className="border-gray-400 mb-2 w-[300px] flex items-center border rounded-md p-1.5">
                                <input
                                    type="text"
                                    name="input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Search user by name..."
                                    className="p-2 outline-none w-[250px]"
                                />
                                <IoSearch className="text-lg text-gray-500" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filterProduct.map((product) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="relative w-full h-40 mb-4 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                                                {!loadedImages[product._id] && (
                                                    <div className="absolute w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                )}
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className={`w-full h-full object-cover rounded-md transition-opacity duration-300 ${loadedImages[product._id] ? "opacity-100" : "opacity-0"
                                                        }`}
                                                    onLoad={() => handleImageLoad(product._id)}
                                                    onError={(e) => {
                                                        e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                                                        handleImageLoad(product._id);
                                                    }}
                                                />
                                            </div>
                                            <h3 className="text-md font-semibold mb-1">{product.name}</h3>
                                            <p className="text-gray-500 text-sm mb-2">{product.brand}</p>
                                            <p className="text-gray-500 text-sm mb-2">{product.description}</p>
                                            <p className="text-blue-600 font-bold mb-3">
                                                ₦
                                                {product.price.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 mb-3">
                                            <button
                                                onClick={() => toggleTrending(product._id)}
                                                className={`text-xs cursor-pointer px-2 py-1 rounded-full font-semibold flex items-center gap-1 transition-colors ${productToggles[product._id]?.trending
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                                    }`}
                                                disabled={loadingToggles[product._id]?.trending}
                                            >
                                                {loadingToggles[product._id]?.trending && (
                                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                )}
                                                Trending: {productToggles[product._id]?.trending ? "True" : "False"}
                                            </button>

                                            <button
                                                onClick={() => toggleNewArrival(product._id)}
                                                className={`text-xs px-2 cursor-pointer py-1 rounded-full font-semibold flex items-center gap-1 transition-colors ${productToggles[product._id]?.newArrival
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                                    }`}
                                                disabled={loadingToggles[product._id]?.newArrival}
                                            >
                                                {loadingToggles[product._id]?.newArrival && (
                                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                )}
                                                New Arrival: {productToggles[product._id]?.newArrival ? "True" : "False"}
                                            </button>
                                        </div>

                                        <div className="flex justify-between">
                                            <button
                                                onClick={() => handleEdit(product._id)}
                                                className="text-sm cursor-pointer px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(product._id)}
                                                className="text-sm cursor-pointer px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                                                disabled={loadingDelete && deleteProductId === product._id}
                                            >
                                                {loadingDelete && deleteProductId === product._id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {open && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"></div>
                    <CreateProductModal closeModal={closeModal} setProducts={setProducts} categories={categories} />
                </>
            )}

            {/* Confirm Delete Modal */}
            {confirmDeleteOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => setConfirmDeleteOpen(false)}
                    ></div>
                    <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-80 max-w-full">
                        <p className="mb-4 text-center text-gray-700">Are you sure you want to delete this product?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setConfirmDeleteOpen(false)}
                                className="px-4 py-2 cursor-pointer rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 cursor-pointer py-2 rounded bg-red-500 hover:bg-red-600 text-white"
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
