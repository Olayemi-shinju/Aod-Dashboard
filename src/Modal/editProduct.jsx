import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

export default function EditProductModal({ closeModal, setProducts, product, categories }) {
  // Form state
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

  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Image handling state
  const [imageOperations, setImageOperations] = useState({
    toKeep: [],       // Existing images to keep
    toRemove: [],     // Existing images to remove
    toAdd: [],        // New images to add
    previews: [],     // Preview URLs for new images
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const MAX_IMAGES = 4;
  const MIN_IMAGES = 1;

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        brand: product.brand || "",
        warranty: product.warranty || "",
        price: product.price?.toString() || "",
        discount: product.discount?.toString() || "0",
        quantity: product.quantity?.toString() || "",
        categoryId: product.categoryId?._id || product.categoryId || "",
      });

      setImageOperations({
        toKeep: [...product.images],
        toRemove: [],
        toAdd: [],
        previews: [],
      });
    }
  }, [product]);

  // Handle file selection with replacement capability
  const handleFileSelect = useCallback((e, replaceIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (replaceIndex !== null) {
      // Replace existing or new image
      setImageOperations(prev => {
        const newState = { ...prev };

        if (replaceIndex < prev.toKeep.length) {
          // Replace existing image
          newState.toRemove = [...prev.toRemove, prev.toKeep[replaceIndex]];
          newState.toKeep = prev.toKeep.filter((_, i) => i !== replaceIndex);
          newState.toAdd = [...prev.toAdd, file];
          newState.previews = [...prev.previews, previewUrl];
        } else {
          // Replace new image
          const adjustedIndex = replaceIndex - prev.toKeep.length;
          // Revoke old preview URL
          URL.revokeObjectURL(prev.previews[adjustedIndex]);
          // Update with new file
          newState.toAdd[adjustedIndex] = file;
          newState.previews[adjustedIndex] = previewUrl;
        }

        return newState;
      });
    } else {
      // Add new image
      setImageOperations(prev => ({
        ...prev,
        toAdd: [...prev.toAdd, file],
        previews: [...prev.previews, previewUrl]
      }));
    }

    e.target.value = ''; // Reset input
  }, []);

  // Remove image
  const removeImage = useCallback((index) => {
    setImageOperations(prev => {
      // Check if we'll have enough images after removal
      const willHaveImages = prev.toKeep.length + prev.toAdd.length - 1;
      if (willHaveImages < MIN_IMAGES) {
        toast.error(`You need at least ${MIN_IMAGES} image`);
        return prev;
      }

      const newState = { ...prev };

      if (index < prev.toKeep.length) {
        // Remove existing image
        newState.toRemove = [...prev.toRemove, prev.toKeep[index]];
        newState.toKeep = prev.toKeep.filter((_, i) => i !== index);
      } else {
        // Remove new image
        const adjustedIndex = index - prev.toKeep.length;
        URL.revokeObjectURL(prev.previews[adjustedIndex]);
        newState.toAdd = prev.toAdd.filter((_, i) => i !== adjustedIndex);
        newState.previews = prev.previews.filter((_, i) => i !== adjustedIndex);
      }

      return newState;
    });
  }, []);

  // Form validation
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.price) errs.price = "Price is required";
    if (isNaN(form.price)) errs.price = "Price must be a number";
    if (!form.categoryId) errs.categoryId = "Category is required";
    
    const totalImages = imageOperations.toKeep.length + imageOperations.toAdd.length;
    if (totalImages < MIN_IMAGES) {
      errs.images = `At least ${MIN_IMAGES} image is required`;
    } else if (totalImages > MAX_IMAGES) {
      errs.images = `Maximum of ${MAX_IMAGES} images allowed`;
    }

    return errs;
  };

  // Handle form submission
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
      
      // Append form data
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      
      // Append image operations
      formData.append('imagesToKeep', JSON.stringify(imageOperations.toKeep));
      formData.append('imagesToRemove', JSON.stringify(imageOperations.toRemove));
      imageOperations.toAdd.forEach(file => formData.append('images', file));

      const resp = await axios.put(
        `${VITE_API_BASE_URL}/edit-product/${product._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (resp.data.success) {
        setProducts(prev => 
          prev.map(p => p._id === product._id ? resp.data.data : p)
        );
        toast.success("Product updated successfully");
        closeModal();
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err?.response?.data?.msg || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      imageOperations.previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageOperations.previews]);

  // Handle input changes
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  // Render image with edit controls
  const renderImage = (src, index, isExisting) => {
    const inputId = `image-input-${index}`;
    
    return (
      <div key={`${isExisting ? 'existing' : 'new'}-${index}`} className="relative group h-40 w-full">
        <img
          src={src}
          alt={`Product ${index + 1}`}
          className="h-full w-full object-cover rounded border shadow-sm"
        />
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <label 
            htmlFor={inputId}
            className="p-2 bg-white/80 rounded-full cursor-pointer hover:bg-white"
            title="Replace image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e, index)}
            />
          </label>
          
          <button
            onClick={() => removeImage(index)}
            className="p-2 bg-white/80 rounded-full hover:bg-white"
            title="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    );
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

        <h2 className="text-xl font-bold mb-4 text-center">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Text Inputs */}
            {['name', 'brand', 'warranty'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="text"
                  name={field}
                  value={form[field]}
                  onChange={handleInput}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors[field] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
                )}
              </div>
            ))}

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInput}
                rows={3}
                className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Number Inputs */}
            {['price', 'quantity', 'discount'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="number"
                  name={field}
                  value={form[field]}
                  onChange={handleInput}
                  min="0"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors[field] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
                )}
              </div>
            ))}

            {/* Category Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleInput}
                className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>
              )}
            </div>
          </div>

          {/* Image Management */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (Min {MIN_IMAGES}, Max {MAX_IMAGES})
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
              {/* Existing images */}
              {imageOperations.toKeep.map((src, index) => (
                renderImage(src, index, true)
              ))}
              
              {/* New images with previews */}
              {imageOperations.previews.map((preview, index) => (
                renderImage(preview, imageOperations.toKeep.length + index, false)
              ))}
              
              {/* Add new image button */}
              {(imageOperations.toKeep.length + imageOperations.toAdd.length) < MAX_IMAGES && (
                <label className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-xs text-gray-500">Add Image</span>
                </label>
              )}
            </div>
            
            {errors.images && (
              <p className="text-xs text-red-500 mt-1">{errors.images}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}