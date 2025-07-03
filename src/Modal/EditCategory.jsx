import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

export default function EditCategory({ closeModal, setCategories, category }) {
    const [name, setName] = useState(category?.name || "");
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(category?.image || null);
    const [imagePublicId] = useState(category?.imagePublicId || ""); // Needed for backend
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
            if (imageFile) {
                formData.append("image", imageFile);
                formData.append("imagePublicId", imagePublicId); // ✅ Include if replacing
            }

            const resp = await axios.put(
                `http://localhost:7000/api/v1/update-category/${category._id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (resp.data.success) {
                setCategories((prev) =>
                    prev.map((cat) => (cat._id === category._id ? resp.data.data : cat))
                );
                closeModal();
                toast.success(resp.data.msg || "Category updated successfully");
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

                <h2 className="text-lg font-semibold mb-4">Edit Category</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm"
                            placeholder="Enter category name"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                        <label htmlFor="category-image" className="block border-dashed border-2 p-4 text-center cursor-pointer">
                            Click to upload
                        </label>
                        <input
                            id="category-image"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="mt-3 h-32 w-full object-contain rounded-lg border"
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={closeModal} className="px-4 cursor-pointer py-2 border rounded">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2  cursor-pointer text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
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
