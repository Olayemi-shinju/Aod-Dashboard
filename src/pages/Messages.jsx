import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../Contexts/Context";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSpinner, FaTrash, FaEnvelope, FaUser, FaBox, FaStar, FaClock } from "react-icons/fa";

function formatTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export default function Messages({ isSidebarOpen }) {
  const [review, setReview] = useState([]);
  const [contact, setContact] = useState([]);
  const { data } = useContext(CartContext);

  // For modal controls:
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'review' or 'contact'
  const [modalAction, setModalAction] = useState(""); // 'single' or 'all'
  const [targetId, setTargetId] = useState(null); // for single delete
  const [loading, setLoading] = useState({
    fetchReviews: false,
    fetchContacts: false,
    deleteReview: false,
    deleteContact: false,
    deleteAllReviews: false,
    deleteAllContacts: false
  });

  const userString = localStorage.getItem("user");
  const userObj = userString ? JSON.parse(userString) : null;
  const token = userObj?.value?.token ?? null;

  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(prev => ({ ...prev, fetchReviews: true }));
        const resp = await axios.get(`${VITE_API_BASE_URL}/get-all-review`);
        if (resp.data.success === true) {
          setReview(resp.data.data);
        } else {
          setReview([]);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch reviews");
      } finally {
        setLoading(prev => ({ ...prev, fetchReviews: false }));
      }
    };

    const fetchContact = async () => {
      try {
        setLoading(prev => ({ ...prev, fetchContacts: true }));
        const resp = await axios.get(`${VITE_API_BASE_URL}/get-all-contact`);
        if (resp.data.success === true) {
          setContact(resp.data.data);
        } else {
          setContact([]);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch contacts");
      } finally {
        setLoading(prev => ({ ...prev, fetchContacts: false }));
      }
    };

    // Call immediately on mount
    fetchReview();
    fetchContact();

    // Set interval for every 60 seconds
    const intervalId = setInterval(() => {
      fetchReview();
      fetchContact();
    }, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Delete single review
  const handleDeleteReview = async (_id) => {
    try {
      setLoading(prev => ({ ...prev, deleteReview: true }));
      const resp = await axios.delete(`${VITE_API_BASE_URL}/delete-review/${_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.data.success) {
        toast.info(resp.data.msg);
        setReview(resp.data.data);  // update state directly
      } else {
        toast.error(resp.data.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error?.response?.data?.msg || "An error occurred");
    } finally {
      setLoading(prev => ({ ...prev, deleteReview: false }));
    }
  };

  // Delete single contact
  const handleDeleteContact = async (_id) => {
    try {
      setLoading(prev => ({ ...prev, deleteContact: true }));
      const resp = await axios.delete(`${VITE_API_BASE_URL}/delete-contact/${_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.data.success) {
        toast.info(resp.data.msg);
        setContact(resp.data.data);  // update state directly
      } else {
        toast.error(resp.data.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error?.response?.data?.msg || "An error occurred");
    } finally {
      setLoading(prev => ({ ...prev, deleteContact: false }));
    }
  };

  // Delete all reviews
  const handleDeleteAllReviews = async () => {
    try {
      setLoading(prev => ({ ...prev, deleteAllReviews: true }));
      const resp = await axios.delete(`${VITE_API_BASE_URL}/delete-all-review`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.data.success) {
        toast.info(resp.data.msg);
        setReview(resp.data.data);  // update state directly
      } else {
        toast.error(resp.data.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error?.response?.data?.msg || "An error occurred");
    } finally {
      setLoading(prev => ({ ...prev, deleteAllReviews: false }));
    }
  };

  // Delete all contacts
  const handleDeleteAllContacts = async () => {
    try {
      setLoading(prev => ({ ...prev, deleteAllContacts: true }));
      const resp = await axios.delete(`${VITE_API_BASE_URL}/delete-all-contact`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.data.success) {
        toast.info(resp.data.msg);
        setContact(resp.data.data);  // update state directly
      } else {
        toast.error(resp.data.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error?.response?.data?.msg || "An error occurred");
    } finally {
      setLoading(prev => ({ ...prev, deleteAllContacts: false }));
    }
  };

  // Open modal helper
  const openModal = (type, action, id = null) => {
    setModalType(type);
    setModalAction(action);
    setTargetId(id);
    setModalOpen(true);
  };

  // Confirm modal delete action
  const confirmDelete = () => {
    setModalOpen(false);
    if (modalAction === "single") {
      if (modalType === "review") handleDeleteReview(targetId);
      else if (modalType === "contact") handleDeleteContact(targetId);
    } else if (modalAction === "all") {
      if (modalType === "review") handleDeleteAllReviews();
      else if (modalType === "contact") handleDeleteAllContacts();
    }
  };

  return (
    <div
      className={`transition-all duration-300 ${isSidebarOpen ? "" : ""} min-h-screen bg-gray-50`}
    >
      {/* Header */}
      <div className="bg-white p-6 shadow flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-800">
          Welcome back, <span className="text-gray-600 font-medium">{data?.name}</span>
        </h1>
      </div>

      {/* Grid Layout */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex justify-between items-center">
            Product Reviews
            <button
              onClick={() => openModal("review", "all")}
              className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm cursor-pointer flex items-center gap-1"
              disabled={review.length === 0 || loading.deleteAllReviews}
              title={review.length === 0 ? "No reviews to delete" : "Delete all reviews"}
            >
              {loading.deleteAllReviews ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <FaTrash /> Delete All
                </>
              )}
            </button>
          </h2>
          <div className="space-y-4">
            {loading.fetchReviews ? (
              <div className="flex justify-center items-center h-40">
                <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
              </div>
            ) : review.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500 text-sm">No reviews available.</p>
              </div>
            ) : (
              review.map((msg) => {
                const timeAgo = formatTimeAgo(new Date(msg.createdAt));
                return (
                  <div
                    key={msg._id}
                    className="bg-gray-50 shadow-sm rounded-lg p-5 border border-gray-100 relative hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => openModal("review", "single", msg._id)}
                      className="absolute top-2 right-2 cursor-pointer text-red-500 text-sm hover:text-red-700 flex items-center gap-1"
                      aria-label="Delete review"
                      disabled={loading.deleteReview}
                    >
                      {loading.deleteReview && targetId === msg._id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <FaTrash /> Delete
                        </>
                      )}
                    </button>

                    <div className="xl:flex items-center gap-4 mt-3">
                      <img
                        src={msg.product?.images?.[0] || '/placeholder-product-image.png'}
                        alt={msg.product?.name || 'Product image'}
                        className="h-20 w-20 object-contain rounded-lg border"
                        onError={(e) => {
                          e.target.src = '/placeholder-product-image.png';
                        }}
                      />
                      <div className="flex-1 items-center">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-1">
                            <FaUser className="text-gray-500" /> {msg.user?.name || 'Unknown'}
                          </h3>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FaClock /> {timeAgo}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <FaEnvelope className="text-gray-500" />
                          <a href={`mailto:${msg.user?.email || ''}`} className="ml-1 hover:text-blue-600">
                            {msg.user?.email || 'No email'}
                          </a>
                        </p>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <FaBox className="text-gray-500" /> {msg.product?.name || 'Unknown product'}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium text-gray-700">Review:</span> {msg.review || 'No review text'}
                        </p>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <FaStar className="text-yellow-500" /> {msg.rating || '0'}/5
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Contact Messages */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex justify-between items-center">
            Contact Messages
            <button
              onClick={() => openModal("contact", "all")}
              className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm cursor-pointer flex items-center gap-1"
              disabled={contact.length === 0 || loading.deleteAllContacts}
              title={contact.length === 0 ? "No contacts to delete" : "Delete all contacts"}
            >
              {loading.deleteAllContacts ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <FaTrash /> Delete All
                </>
              )}
            </button>
          </h2>
          <div className="space-y-4">
            {loading.fetchContacts ? (
              <div className="flex justify-center items-center h-40">
                <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
              </div>
            ) : contact.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500 text-sm">No contact messages available.</p>
              </div>
            ) : (
              contact.map((msg) => {
                const timeAgo = formatTimeAgo(new Date(msg.createdAt));
                return (
                  <div
                    key={msg._id}
                    className="bg-gray-50 shadow-sm rounded-lg p-5 border border-gray-100 relative hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => openModal("contact", "single", msg._id)}
                      className="absolute top-2 right-2 cursor-pointer text-red-500 text-sm hover:text-red-700 flex items-center gap-1"
                      aria-label="Delete contact message"
                      disabled={loading.deleteContact}
                    >
                      {loading.deleteContact && targetId === msg._id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <FaTrash /> Delete
                        </>
                      )}
                    </button>

                    <div className="xl:flex justify-between items-center mb-2">
                      <div className="flex flex-col justify-center gap-2">
                        <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-1">
                          <FaUser className="text-gray-500" /> {msg.name}
                        </h3>
                        <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-1">
                          <FaEnvelope className="text-gray-500" />
                          <a href={`mailto:${msg.email}`} className="hover:text-blue-600"> {msg.email}</a>
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FaClock /> {timeAgo}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{msg.message}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {modalAction === "all"
                ? `Confirm delete all ${modalType === "review" ? "reviews" : "contacts"}?`
                : `Confirm delete this ${modalType === "review" ? "review" : "contact message"}?`}
            </h3>
            <p className="mb-6 text-gray-600">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer transition-colors duration-200 flex items-center gap-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer transition-colors duration-200 flex items-center gap-2"
                disabled={
                  (modalType === "review" && modalAction === "all" && loading.deleteAllReviews) ||
                  (modalType === "review" && modalAction === "single" && loading.deleteReview) ||
                  (modalType === "contact" && modalAction === "all" && loading.deleteAllContacts) ||
                  (modalType === "contact" && modalAction === "single" && loading.deleteContact)
                }
              >
                {(
                  (modalType === "review" && modalAction === "all" && loading.deleteAllReviews) ||
                  (modalType === "review" && modalAction === "single" && loading.deleteReview) ||
                  (modalType === "contact" && modalAction === "all" && loading.deleteAllContacts) ||
                  (modalType === "contact" && modalAction === "single" && loading.deleteContact)
                ) ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrash />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}