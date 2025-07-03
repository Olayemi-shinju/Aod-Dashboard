// src/components/ProtectedRoute.js
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { CartContext } from "../Contexts/Context";

export default function ProtectedRoute({ children }) {
  const { user } = useContext(CartContext);
  const [loading, setLoading] = useState(true);

  // Wait a bit for context to load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
