import {
  FaBell,
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure this is imported
import { CartContext } from "../Contexts/Context";

export default function Dashboard() {
  const { setUser, data } = useContext(CartContext)
  const [input, setInput] = useState("");

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Mark Johnson", email: "mark@example.com" },
  ];

  const sendmail = data?.email

  const recentOrders = [
    { id: 101, item: "Nike Sneakers", date: "2025-06-18", amount: "$120" },
    { id: 102, item: "Apple Watch", date: "2025-06-19", amount: "$250" },
    { id: 103, item: "Samsung TV", date: "2025-06-20", amount: "$800" },
  ];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(input.toLowerCase())
  );

  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      // You can uncomment this if you have a logout endpoint:
      const resp = await axios.post("http://localhost:7000/api/v1/logout", { email: sendmail});
      if (resp.data.success === true) {
        setUser(resp.data)
        localStorage.removeItem("user");
        toast.success("Logged out successfully");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  return (
    <div className="transition-all duration-300">
      {/* Top Navbar */}
      <div className="bg-white p-6 shadow z-30 flex flex-wrap items-center justify-between gap-4 w-full">
        <div className="w-full flex items-center justify-between">
          <div className="text-md font-bold hidden sm:block">
            Welcome back,{" "}
            <span className="font-normal">{data?.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative bg-gray-200 px-3 py-2 cursor-pointer rounded-md flex items-center justify-center w-10 h-10">
              <Link to='messages'>
                <FaBell className="text-sm" />
                
              </Link>
            </div>
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
          <Card
            title="Customers"
            value="3"
            icon={<FaUsers className="text-blue-500 text-2xl" />}
          />
          <Card
            title="Orders"
            value="320"
            icon={<FaShoppingCart className="text-green-500 text-2xl" />}
          />
          <Card
            title="Revenue"
            value="$9,820"
            icon={<FaDollarSign className="text-yellow-500 text-2xl" />}
          />
          <Card
            title="Notifications"
            value="5"
            icon={<FaBell className="text-red-500 text-2xl" />}
          />
        </div>

        {/* Order Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card
            title="Pending Orders"
            value="8"
            icon={<FaShoppingCart className="text-orange-500 text-2xl" />}
          />
          <Card
            title="Completed Orders"
            value="290"
            icon={<FaShoppingCart className="text-green-600 text-2xl" />}
          />
        </div>

        {/* Users Table + Orders Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Table */}
          <div className="col-span-2 bg-white p-4 rounded-lg shadow">
            <div className="xl:flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-4">Customer List</h3>
              <div className="border-gray-400 mb-2 flex items-center border rounded-md p-1.5">
                <input
                  type="text"
                  name="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Search user by name..."
                  className="p-2 outline-none w-[480px]"
                />
                <IoSearch className="text-lg text-gray-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 gap-5 flex items-center text-right space-x-2">
                        <button className="text-blue-500 cursor-pointer hover:text-blue-700">
                          <FaEdit />
                        </button>
                        <button className="text-red-500 cursor-pointer hover:text-red-700">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Preview */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <ul className="space-y-3">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-start justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{order.item}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <span className="text-sm font-semibold">{order.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
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
