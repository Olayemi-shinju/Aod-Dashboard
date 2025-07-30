import {
  FaBell,
  FaShoppingCart,
  FaDollarSign,
} from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { useContext } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../Contexts/Context";
import LowStockDashboard from "../components/lowStock";
import RecentOrders from "../components/recentOrder";
// import AdminWishlistPage from "../components/wishList";

export default function Dashboard() {
  const { setUser, data, user } = useContext(CartContext);
  const sendmail = data?.email;
  const navigate = useNavigate();
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleLogout = async () => {
    try {
      const resp = await axios.post(`${VITE_API_BASE_URL}/logout`, {
        email: sendmail,
      });
      if (resp.data.success === true) {
        setUser(resp.data);
        localStorage.removeItem("user");
        toast.success("Logged out successfully");
        navigate("/login");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="transition-all duration-300">
      {/* Top Navbar */}
      <div className="bg-white p-6 shadow z-30 flex flex-wrap items-center justify-between gap-4 w-full">
        <div className="w-full flex items-center justify-between">
          <div className="text-md font-bold hidden sm:block">
            Welcome back, <span className="font-normal">{data?.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="messages"
              className="relative bg-gray-200 px-3 py-2 cursor-pointer rounded-md flex items-center justify-center w-10 h-10"
            >
              <FaBell className="text-sm" />
            </Link>
            <div
              onClick={handleLogout}
              className="bg-gray-200 px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer"
            >
              <CiLogout className="text-black font-bold" />
              <span className="text-sm hidden font-bold sm:inline">
                Log Out
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="mt-6 p-6">
        <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card title="Customers" value='1' icon={<FaDollarSign className="text-yellow-500 text-2xl" />} />
          <Card title="Orders" value="320" icon={<FaShoppingCart className="text-green-500 text-2xl" />} />
          <Card title="Revenue" value="$9,820" icon={<FaDollarSign className="text-yellow-500 text-2xl" />} />
          <Card title="Notifications" value="5" icon={<FaBell className="text-red-500 text-2xl" />} />

        </div>

        {/* Order Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card title="Pending Orders" value="8" icon={<FaShoppingCart className="text-orange-500 text-2xl" />} />
          <Card title="Completed Orders" value="290" icon={<FaShoppingCart className="text-green-600 text-2xl" />} />
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-4 rounded-lg shadow">
          <RecentOrders />
        </div>
      </div>

      <LowStockDashboard />
      {/* <AdminWishlistPage/> */}
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-xl font-bold">{value}</p>
      </div>
      {icon}
    </div>
  );
}