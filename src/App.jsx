// src/App.js
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NetworkWrapper from "./components/networkRoute";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import SideBarLayout from "./Navigations/SideBarLayout";
import User from "./pages/User";
import RegisterPage from "./Authentication/Register";
import LoginPage from "./Authentication/Login";
import ForgotPasswordPage from "./Authentication/ForgotPassword";
import OTPForm from "./Authentication/Otp";
import ResetPasswordPage from "./Authentication/ResetPassword";
import { CartProvider } from "./Contexts/Context";
import ProtectedRoute from "./components/ProtectedRoute";
import { Electonics } from "./pages/Electronics";
import { Projects } from "./pages/Projects";

export default function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <CartProvider>
        <NetworkWrapper>
          <Routes>
            {/* ✅ Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SideBarLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<Categories />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="profile" element={<Profile />} />
              <Route path="messages" element={<Messages />} />
              <Route path="users" element={<User />} />
              <Route path="electronics" element={<Electonics />} />
              <Route path="project" element={<Projects />} />

            </Route>

            {/* ✅ Public Routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/otp" element={<OTPForm />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Routes>
        </NetworkWrapper>
      </CartProvider>
    </>
  );
}
