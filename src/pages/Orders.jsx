import { useContext, useEffect, useState } from "react";
import { CartContext } from "../Contexts/Context";
import axios from "axios";
import { toast } from "react-toastify";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const get = JSON.parse(localStorage.getItem("user"));
  const token = get?.value?.token;
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    let intervalId;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${VITE_API_BASE_URL}/get-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        toast.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    intervalId = setInterval(fetchOrders, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = async (_id) => {
    setLoadingDelete(true);
    try {
      const resp = await axios.delete(
        `${VITE_API_BASE_URL}/delete-order/${_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (resp.data.success) {
        toast.success(resp.data.msg);
        const updatedOrders = resp.data.data;
        setOrders(updatedOrders);
      } else {
        toast.error(resp.data.msg || "Delete failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Delete failed");
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleConfirmEdit = async (_id) => {
    setLoadingEdit(true);
    try {
      const resp = await axios.patch(
        `${VITE_API_BASE_URL}/status/${_id}`,
        { status: "successful" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (resp.data.success) {
        toast.success("Order confirmed");

        const updatedOrder = resp.data.data;
        setOrders((prev) =>
          prev.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleCancelOrder = async (_id) => {
    setLoadingCancel(true);
    try {
      const resp = await axios.patch(
        `${VITE_API_BASE_URL}/status/${_id}`,
        { status: "cancelled" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (resp.data.success) {
        toast.success("Order cancelled");
        const updatedOrder = resp.data.data;
        setOrders((prev) =>
          prev.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      }
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setLoadingCancel(false);
    }
  };

  const exportToCSV = (order) => {
    if (order.status !== "successful") {
      toast.error("Only successful orders can be exported");
      return;
    }

    const total = order.products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );

    const csvHeader = "Customer,Email,Date,Total,Status\n";
    const csvBody = `${order.user.name},${order.user.email},${new Date(
      order.createdAt
    ).toLocaleDateString()},${total},${order.status}`;

    const blob = new Blob([csvHeader + csvBody], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `order_${order._id}.csv`;
    link.click();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesDate = filterDate
      ? new Date(order.createdAt).toISOString().split("T")[0] === filterDate
      : true;

    const matchesSearch = searchTerm
      ? order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products?.some((p) =>
          p.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;

    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    return matchesDate && matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  return (
    <div className="relative p-6 bg-white shadow rounded-lg">
      {(loading || loadingDelete || loadingEdit || loadingCancel) && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {showConfirmModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowConfirmModal(false)}
          ></div>
          <div className="fixed z-50 top-1/2 left-1/2 bg-white p-6 rounded-lg shadow transform -translate-x-1/2 -translate-y-1/2">
            <p className="mb-4">Are you sure you want to delete this order?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleDelete(selectedOrderId);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                {loadingDelete ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </>
      )}

      <h1 className="text-lg font-bold mb-4">Enhanced Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border p-2 rounded text-sm"
        />
        <input
          type="text"
          placeholder="Search customer or product"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded text-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="successful">Successful</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2">SN</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order, idx) => {
              const total = order.products.reduce(
                (sum, p) => sum + p.price * p.quantity,
                0
              );
              return (
                <tr key={order._id} className="border-b">
                  <td className="px-4 py-2">{idx + 1 + (currentPage - 1) * ordersPerPage}</td>
                  <td className="px-4 py-2">
                    <div>{order.user?.name}</div>
                    <div className="text-xs text-gray-500">{order.user?.email}</div>
                  </td>
                  <td className="px-4 py-2">
                    {order.products.map((p, i) => (
                      <div key={i} className="text-xs">
                        {p.product?.name} x {p.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">₦{total.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "successful"
                        ? "bg-green-100 text-green-600"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex flex-col sm:flex-row gap-2">
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleConfirmEdit(order._id)}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectedOrderId(order._id);
                        setShowConfirmModal(true);
                      }}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    {order.status === "successful" && (
                      <button
                        onClick={() => exportToCSV(order)}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Export
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <p className="text-center py-4 text-gray-500">No matching orders found.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded border ${
              currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}