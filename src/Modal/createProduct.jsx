import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

export default function CreateProductModal({ closeModal, setProducts, categories }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    brand: "",
    warranty: "",
    price: "",
    discount: "",
    quantity: "",
    categoryId: "",
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const get = JSON.parse(localStorage.getItem("user"));
  const adminId = get?.value?.id;

  useEffect(() => {
    if (images.length > 0) {
      const urls = images.map((file) => URL.createObjectURL(file));
      setPreviews(urls);
      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    } else {
      setPreviews([]);
    }
  }, [images]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.price) errs.price = "Price is required.";
    if (!form.categoryId) errs.categoryId = "Category is required.";
    if (images.length === 0) errs.images = "At least one image is required.";
    if (images.length > 4) errs.images = "Maximum of 4 images allowed.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      for (const key in form) formData.append(key, form[key]);
      images.forEach((img) => formData.append("images", img));

      const resp = await axios.post(
        `http://localhost:7000/api/v1/create-product/${adminId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (resp.data.success === true) {
        setProducts((prev) => [...prev, resp.data.data]);
        toast.success(resp.data.msg);
        closeModal();
      }
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Product creation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 relative"
      >
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Create Product</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["name", "description", "brand", "warranty"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                  {field}
                </label>
                <input
                  type="text"
                  name={field}
                  value={form[field]}
                  onChange={handleInput}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${field}`}
                />
                {errors[field] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
                )}
              </div>
            ))}
            {["price", "quantity"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                  {field}
                </label>
                <input
                  type="number"
                  name={field}
                  value={form[field]}
                  onChange={handleInput}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${field}`}
                />
                {errors[field] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleInput}
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images (max 4)
            </label>
            <label
              htmlFor="product-images"
              className="block w-full border border-dashed border-gray-300 rounded-md p-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer text-center"
            >
              <p className="text-sm text-gray-500">Click to upload images</p>
              <p className="text-xs text-gray-400 mt-1">{images.length} / 4 images selected</p>
            </label>
            <input
              id="product-images"
              type="file"
              accept="image/*"
              multiple
              disabled={images.length >= 4}
              style={{ display: "none" }}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const total = images.length + files.length;
                if (total > 4) {
                  setErrors((prev) => ({
                    ...prev,
                    images: "Maximum 4 images allowed.",
                  }));
                } else {
                  setImages((prev) => [...prev, ...files]);
                  setErrors((prev) => ({ ...prev, images: null }));
                }
              }}
            />
            {errors.images && (
              <p className="text-xs text-red-500 mt-1">{errors.images}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {previews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="h-24 w-full object-cover rounded border shadow-sm"
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border cursor-pointer rounded text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
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
                  Submitting...
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
