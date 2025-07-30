import { useContext, useEffect, useState } from "react";
import { CartContext } from "../Contexts/Context";
import axios from "axios";
import { FiTrash, FiPlus } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

export const Electonics = ({ isSidebarOpen }) => {
  const { data } = useContext(CartContext);
  const [electronics, setElectronics] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "" });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const get = JSON.parse(localStorage.getItem("user"));
  const token = get?.value?.token;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const fetchElectronics = async () => {
    try {
      const res = await axios.get(`${VITE_API_BASE_URL}/electronics/get-all-electronics`, config);
      setElectronics(res.data.data);
    } catch (err) {
      console.error("Fetch error", err.response?.data?.msg || err.message);
    }
  };

  useEffect(() => {
    fetchElectronics();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!form.name || !form.category) return;
    setLoading(true);
    try {
      if (editId) {
        const res = await axios.put(
          `${VITE_API_BASE_URL}/electronics/update-electronic/${editId}`,
          { name: form.name, Wattage: form.category },
          config
        );
        if (res.data.success === true) {
          setElectronics((prev) =>
            prev.map((item) => (item._id === editId ? res.data.data : item))
          );
          toast.success(res.data.msg);
        }
      } else {
        const res = await axios.post(
          `${VITE_API_BASE_URL}/electronics/create-electronics`,
          { name: form.name, Wattage: form.category },
          config
        );
        if (res.data.success === true) {
          setElectronics((prev) => [...prev, res.data.data]);
          toast.success(res.data.msg);
        }
      }
      setModalOpen(false);
      setForm({ name: "", category: "" });
      setEditId(null);
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message);
      console.error("Submit error", err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this electronic?");
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `${VITE_API_BASE_URL}/electronics/delete-electronics/${id}`,
        config
      );
      if (res.data.success === true) {
        setElectronics(res.data.data);
        toast.info(res.data.msg);
      }
    } catch (err) {
      console.error("Delete error", err.response?.data?.msg || err.message);
    }
  };

  const handleEdit = (el) => {
    setForm({ name: el.name, category: el.Wattage });
    setEditId(el._id);
    setModalOpen(true);
  };

  return (
    <div className={`transition-all duration-300 min-h-screen bg-gradient-to-tr from-gray-100 to-white`}>
      {/* Header */}
      <div className="bg-white p-6 shadow-md flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">
          Welcome back, <span className="font-normal text-gray-600">{data?.name}</span>
        </h1>
        <button
          onClick={() => {
            setModalOpen(true);
            setEditId(null);
            setForm({ name: "", category: "" });
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
        >
          <FiPlus className="text-md" /> Add Electronic
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative transition-all">
            <button
              onClick={() => {
                setModalOpen(false);
                setEditId(null);
                setForm({ name: "", category: "" });
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
            >
              <AiOutlineClose />
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editId ? "Edit Electronic" : "Create Electronic"}
            </h2>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              type="text"
              placeholder="Wattage"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={handleCreateOrUpdate}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-md"
            >
              {loading ? (editId ? "Updating..." : "Creating...") : editId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 uppercase tracking-wide text-gray-700 text-xs">
              <tr>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Wattage</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {electronics.map((el) => (
                <tr key={el._id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-3 px-6">{el.name}</td>
                  <td className="py-3 px-6">{el.Wattage}</td>
                  <td className="py-3 px-6 flex gap-4">
                    <button
                      onClick={() => handleEdit(el)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(el._id)}
                      className="text-red-600 hover:underline flex items-center gap-1"
                    >
                      <FiTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {electronics.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-400">
                    No electronics added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
