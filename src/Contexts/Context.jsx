// src/Contexts/Context.js
import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

// Define API base URL using environment variable
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL
 const get = JSON.parse(localStorage.getItem('user'))
  const token = get?.value?.token

export const CartProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({});

  // Load user from localStorage and check expiry
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.value && parsed.expiry > Date.now()) {
          setUser(parsed.value);
        } else {
          localStorage.removeItem("user");
          window.location.href = '/login'
        }
      } catch (err) {
        localStorage.removeItem("user");
        window.location.href = '/login'
      }
    }
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.id) return;
      try {
        const resp = await axios.get(`${VITE_API_BASE_URL}/get-single-user/${user.id}`, {
          headers: {Authorization: `Bearer ${token}`}
        });
        setData(resp.data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [user]);

  const values = {
    user,
    setUser,
    data,
    setData,
  };

  return <CartContext.Provider value={values}>{children}</CartContext.Provider>;
};
