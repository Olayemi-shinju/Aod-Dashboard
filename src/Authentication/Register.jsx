import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";


const RegisterPage = () => {
    
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('')
    const [loader, setLoader] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        email: '',
        phone: '',
        role: 'admin'
    })

  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


    const navigate = useNavigate()
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
    e.preventDefault()
        setLoader(true)
        try {
            if (!formData.name || !formData.password || !formData.email || !formData.phone) {
                setLoader(false)
                setError('Pls Fill All Fields')
                return
            }
            const resp = await axios.post(`${VITE_API_BASE_URL}/sign`, formData)
            if (resp.data.success === true) {
                toast.success(resp.data.data.msg)
                setLoader(false)
                localStorage.setItem('email', resp.data.data.email)
                navigate('/otp')
            } else {
                toast.error(resp.data.data.msg)
                setLoader(false)
            }
        } catch (error) {
            setLoader(false)
            toast.error(error.response?.data?.msg)
        }
    }

    return (
        <div className="py-7 flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md"
                onSubmit={(e) => e.preventDefault()}
            >
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Create Account
                </h2>

                <div className="flex items-center justify-between my-6">
                    <span className="border-t w-1/5 border-gray-300"></span>
                    <span className="text-sm text-gray-500">register with email</span>
                    <span className="border-t w-1/5 border-gray-300"></span>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        name='name'
                        placeholder="Full Name"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="tel"
                        onChange={handleChange}
                        name='phone'
                        value={formData.phone}
                        placeholder="Phone Number"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="email"
                        name='email'
                        onChange={handleChange}
                        value={formData.email}
                        placeholder="Email Address"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            name='password'
                            onChange={handleChange}
                            value={formData.password}
                            className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {
                            error && <p className="h-5 text-lg text-red-600 p-2">{error}</p>
                        }
                        <button
                            type="button"
                            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>

                   

                    <button
                        type="submit"
                    
                        className="w-full wish cursor-pointer bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loader ? (
                            <div className="flex justify-center items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Please wait...
                            </div>
                        ) : (
                            "Register"
                        )}
                    </button>

                </form>

                <p className="text-sm text-center text-gray-600 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
