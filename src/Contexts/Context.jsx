// src/Contexts/Context.js
import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

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
        const resp = await axios.get(`http://localhost:7000/api/v1/get-single-user/${user.id}`);
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
