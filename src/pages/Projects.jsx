import { useContext, useEffect, useState } from "react";
import { CartContext } from "../Contexts/Context";
import axios from "axios";
import { FiTrash, FiPlus, FiEdit2 } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import ClipLoader from "react-spinners/ClipLoader";

export const Projects = () => {
  const { data } = useContext(CartContext);
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const get = JSON.parse(localStorage.getItem("user"));
  const token = get?.value?.token;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectImage, setProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${VITE_API_BASE_URL}/get-project`);
      const fetchedProjects = res.data?.data || [];
      if (fetchedProjects.length === 0) {
        setErrorMsg("No projects found.");
      }
      setProjects(fetchedProjects);
    } catch {
      setErrorMsg("Failed to fetch projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!projectName || !projectImage) {
      setErrorMsg("Please provide a project name and an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("project", projectImage);

    try {
      setUploading(true);
      await axios.post(`${VITE_API_BASE_URL}/upload-project`, formData, config);
      fetchProjects();
      setShowModal(false);
      setProjectName("");
      setProjectImage(null);
      setImagePreview(null);
      setErrorMsg("");
    } catch {
      setErrorMsg("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${VITE_API_BASE_URL}/delete-project/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    } catch {
      setErrorMsg("Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (proj) => {
    setEditId(proj._id);
    setEditName(proj.name);
    setEditPreview(proj.project[0]);
    setEditImage(null);
    setEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editName) {
      setErrorMsg("Project name is required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", editName);
    if (editImage) {
      formData.append("project", editImage);
    }

    try {
      setUpdating(true);
      await axios.put(`${VITE_API_BASE_URL}/update-project/${editId}`, formData);
      fetchProjects();
      setEditModal(false);
      setEditName("");
      setEditImage(null);
      setEditPreview(null);
    } catch {
      setErrorMsg("Failed to update project.");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">
          Welcome back, <span className="font-normal text-gray-600">{data?.name}</span>
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <FiPlus /> Upload project
        </button>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="text-center text-red-600 mt-6 text-sm">{errorMsg}</div>
      )}

      {/* Project Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <ClipLoader size={35} color="#2563eb" />
          </div>
        ) : (
          projects.map((proj) => (
            <div key={proj._id} className="bg-white rounded-xl shadow-md overflow-hidden relative">
              <img
                src={proj.project[0]}
                alt={proj.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h2 className="text-md font-medium text-gray-800">{proj.name}</h2>
                <div className="mt-3 flex gap-4">
                  <button
                    onClick={() => handleDelete(proj._id)}
                    disabled={deletingId === proj._id}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                  >
                    {deletingId === proj._id ? (
                      <ClipLoader size={14} color="red" />
                    ) : (
                      <>
                        <FiTrash /> Delete
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(proj)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <FiEdit2 /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              onClick={() => setShowModal(false)}
            >
              <AiOutlineClose size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Upload New Project
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setProjectImage(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
              />
              {imagePreview && (
                <img src={imagePreview} className="mt-3 w-full h-40 object-cover rounded-lg" />
              )}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-2 rounded-md flex justify-center items-center gap-2"
              >
                {uploading ? <ClipLoader size={20} color="#fff" /> : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              onClick={() => setEditModal(false)}
            >
              <AiOutlineClose size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Edit Project
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Project Name"
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setEditImage(file);
                  setEditPreview(URL.createObjectURL(file));
                }}
              />
              {editPreview && (
                <img src={editPreview} className="mt-3 w-full h-40 object-cover rounded-lg" />
              )}
              <button
                onClick={handleEditSubmit}
                disabled={updating}
                className="w-full bg-blue-600 text-white py-2 rounded-md flex justify-center items-center gap-2"
              >
                {updating ? <ClipLoader size={20} color="#fff" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
