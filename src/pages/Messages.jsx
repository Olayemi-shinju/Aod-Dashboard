import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../Contexts/Context";
import axios from "axios";
import { toast } from "react-toastify";

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
  const userString = localStorage.getItem("user");
  const userObj = userString ? JSON.parse(userString) : null;
  const token = userObj?.value?.token ?? null;


  useEffect(() => {
    const fetchReview = async () => {
      try {
        const resp = await axios.get("http://localhost:7000/api/v1/get-all-review");
        if (resp.data.success === true) {
          setReview(resp.data.data);
        } else {
          setReview([]);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchContact = async () => {
      try {
        const resp = await axios.get("http://localhost:7000/api/v1/get-all-contact");
        if (resp.data.success === true) {
          setContact(resp.data.data);
        } else {
          setContact([]);
        }
      } catch (error) {
        console.log(error);
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
      const resp = await axios.delete(`http://localhost:7000/api/v1/delete-review/${_id}`, {
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
    }
  };

  // Delete single contact
  const handleDeleteContact = async (_id) => {
    try {
      const resp = await axios.delete(`http://localhost:7000/api/v1/delete-contact/${_id}`, {
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
    }
  };

  // Delete all reviews
  const handleDeleteAllReviews = async () => {
    try {
      const resp = await axios.delete(`http://localhost:7000/api/v1/delete-all-review`, {
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
    }
  };

  // Delete all contacts
  const handleDeleteAllContacts = async () => {
    try {
      const resp = await axios.delete(`http://localhost:7000/api/v1/delete-all-contact`, {
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
        <h1 className="text-sm font-bold">
          Welcome back, <span className="text-sm font-normal">{data?.name}</span>
        </h1>
      </div>

      {/* Grid Layout */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews */}
        <div>
          <h2 className="text-base font-semibold mb-4 text-gray-800 flex justify-between items-center">
            Product Reviews
            <button
              onClick={() => openModal("review", "all")}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm cursor-pointer"
              disabled={review.length === 0}
              title={review.length === 0 ? "No reviews to delete" : "Delete all reviews"}
            >
              Delete All
            </button>
          </h2>
          <div className="space-y-4">
            {review.length === 0 && (
              <p className="text-gray-500 text-sm">No reviews available.</p>
            )}
            {review.map((msg) => {
              const timeAgo = formatTimeAgo(new Date(msg.createdAt));
              return (
                <div
                  key={msg._id}
                  className="bg-white shadow-sm rounded-lg p-5 border border-gray-100 relative"
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => openModal("review", "single", msg._id)}
                    className="absolute top-2 right-2  cursor-pointer text-red-500 text-sm hover:text-red-700"
                    aria-label="Delete review"
                  >
                    Delete
                  </button>

                  <div className="xl:flex items-center gap-4 mt-3">
                    <img
                      src={msg.product?.images[0]}
                      alt={msg.product?.name}
                      className="h-20 w-20 object-contain rounded-lg border"
                    />
                    <div className="flex-1 items-center">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm text-gray-800"><span className="font-medium text-gray-700">User:</span> {msg.user?.name}</h3>
                        <span className="text-xs text-gray-500">{timeAgo}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium text-gray-700">Email:</span> <a href="mailto:">{msg.user?.email}</a>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium text-gray-700">Product:</span> {msg.product?.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium text-gray-700">Review:</span> {msg.review}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium text-gray-700">Rated:</span> {msg.rating}/5
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Messages */}
        <div>
          <h2 className="text-base font-semibold mb-4 text-gray-800 flex justify-between items-center">
            Contact Messages
            <button
              onClick={() => openModal("contact", "all")}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm cursor-pointer"
              disabled={contact.length === 0}
              title={contact.length === 0 ? "No contacts to delete" : "Delete all contacts"}
            >
              Delete All
            </button>
          </h2>
          <div className="space-y-4">
            {contact.length === 0 && (
              <p className="text-gray-500 text-sm">No contact messages available.</p>
            )}
            {contact.map((msg) => {
              const timeAgo = formatTimeAgo(new Date(msg.createdAt));
              return (
                <div
                  key={msg._id}
                  className="bg-white shadow-sm rounded-lg p-5 border border-gray-100 relative"
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => openModal("contact", "single", msg._id)}
                    className="absolute top-2 right-2 cursor-pointer text-red-500 text-sm hover:text-red-700"
                    aria-label="Delete contact message"
                  >
                    Delete
                  </button>

                  <div className="xl:flex justify-between items-center mb-2">
                    <div className="flex flex-col justify-center gap-2">
                      <h3 className="font-semibold text-sm text-gray-800">User: {msg.name}</h3>
                      <h3 className="font-semibold text-sm text-gray-800">Email: <a href="mailto:"> {msg.email}</a></h3>
                    </div>
                    <span className="text-xs text-gray-500">{timeAgo}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{msg.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.3)", // lighter transparent background
            backdropFilter: "blur(6px)", // subtle blur, no blue tint
            WebkitBackdropFilter: "blur(6px)", // for Safari support
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {modalAction === "all"
                ? `Confirm delete all ${modalType === "review" ? "reviews" : "contacts"}?`
                : `Confirm delete this ${modalType === "review" ? "review" : "contact message"}?`}
            </h3>
            <p className="mb-6 text-gray-700">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
