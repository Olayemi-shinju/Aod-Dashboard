import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

export default function CreateCategoryModal({ closeModal, setCategories }) {
    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const get = JSON.parse(localStorage.getItem("user"));
    const id = get?.value?.id;

    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile]);

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Category name is required.";
        if (!imageFile) newErrors.image = "Category image is required.";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("image", imageFile);

            const resp = await axios.post(
                `${VITE_API_BASE_URL}/create-category/${id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (resp.data.success) {
                setCategories((prev) => [...prev, resp.data.data]);
                setName("");
                setImageFile(null);
                closeModal();
                toast.success(resp.data.msg);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.response?.data?.msg || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative"
            >
                <button
                    onClick={closeModal}
                    className="absolute top-3 cursor-pointer right-3 text-gray-500 hover:text-gray-800 text-xl"
                >
                    &times;
                </button>

                <h2 className="text-lg font-semibold mb-4">Create Category</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            name="name"
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter category name"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Image
                        </label>

                        <label
                            htmlFor="category-image"
                            className="block w-full border border-dashed border-gray-300 rounded-md p-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer text-center"
                        >
                            <p className="text-sm text-gray-500">Click to upload an image</p>
                        </label>

                        <input
                            id="category-image"
                            type="file"
                            name="image"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setImageFile(file);
                                    setErrors((prev) => ({ ...prev, image: null }));
                                }
                            }}
                        />

                        {errors.image && (
                            <p className="text-xs text-red-500 mt-1">{errors.image}</p>
                        )}

                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="mt-3 h-32 w-full object-contain rounded-lg border border-gray-200 shadow-sm"
                            />
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 cursor-pointer text-sm border rounded hover:bg-gray-100"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 cursor-pointer text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        ></path>
                                    </svg>
                                    Loading...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
