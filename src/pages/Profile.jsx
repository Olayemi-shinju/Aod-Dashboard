import { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUserCircle, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
import { CartContext } from "../Contexts/Context"; // 👈 or use your new UserContext
import axios from "axios"; // ✅ Make sure axios is installed
import { toast } from "react-toastify";

export default function Profile({ isSidebarOpen }) {
  const { data, setUser, setData } = useContext(CartContext); // 👈 You may switch this to UserContext

  // get token
 const get = JSON.parse(localStorage.getItem('user'))
  const token = get?.value?.token

  // get adminId
  const id = get?.value.id
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });

  useEffect(() => {
    if (data) {
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || ""
      });
      setTempProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || ""
      });
    }
  }, [data]);

  // ✅ Save updated profile to backend
  const handleSave = async () => {
    try {
       const resp = await axios.put(`http://localhost:7000/api/v1/update-user/${id}`, {name: tempProfile.name, phone: tempProfile.phone}, { headers: { Authorization: `Bearer ${token}` } })
      if (resp.data.success === true) {
        toast.success(resp.data.msg)
        setData(resp?.data?.data)
        setUser(resp?.data?.data)
        setProfile({ ...tempProfile });
        setEditMode(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Optionally show toast error
    }
  };

  const handleChange = (e) => {
    setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setTempProfile({ ...profile });
    setEditMode(false);
  };

  return (
    <div className={`transition-all duration-300 ${isSidebarOpen ? "" : ""}`}>
      {/* Header */}
      <div className="bg-white p-6 shadow-sm border-b">
        <h1 className="text-xl font-semibold text-gray-800">Admin Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-md"
      >
        <div className="flex justify-center mb-6">
          <FaUserCircle className="text-gray-300" size={96} />
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
              <FaUser className="text-gray-400" /> Full Name
            </label>
            {editMode ? (
              <input
                type="text"
                name="name"
                value={tempProfile.name}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-base text-gray-800 font-medium">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
              <FaEnvelope className="text-gray-400" /> Email Address
            </label>
            {editMode ? (
              <input
                type="email"
                name="email"
                value={tempProfile.email}
                disabled
                className="w-full border px-4 py-2 rounded-md text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            ) : (
              <p className="text-base text-gray-800">{profile.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
              <FaPhone className="text-gray-400" /> Phone Number
            </label>
            {editMode ? (
              <input
                type="tel"
                name="phone"
                value={tempProfile.phone}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-base text-gray-800">{profile.phone}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          {editMode ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-5 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
