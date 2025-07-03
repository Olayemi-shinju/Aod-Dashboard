import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const OTPForm = () => {
  const email = localStorage.getItem('email');
  const OTP_LENGTH = 6;
  const RESEND_TIME = 30;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(RESEND_TIME);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputsRef = useRef([]);

  const navigate = useNavigate()

  useEffect(() => {
    if (timeLeft === 0) {
      setResendAvailable(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (e, index) => {
    const inputValue = e.target.value.replace(/\D/g, '');
    if (!inputValue) return;

    const newOtp = [...otp];

    if (inputValue.length > 1) {
      const chars = inputValue.slice(0, OTP_LENGTH).split('');
      chars.forEach((char, i) => {
        newOtp[i] = char;
        if (inputsRef.current[i]) {
          inputsRef.current[i].value = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = chars.length < OTP_LENGTH ? chars.length : OTP_LENGTH - 1;
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = inputValue;
    setOtp(newOtp);

    if (index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
      } else if (index > 0) {
        newOtp[index - 1] = '';
        inputsRef.current[index - 1]?.focus();
      }
      setOtp(newOtp);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== OTP_LENGTH) {
      setError('Please complete the OTP.');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:7000/api/v1/verifyOtp', {
        otp: enteredOtp,
        email,
      });
      if (response.data.success === true) {
        navigate('/login')
        toast.success(response?.data.msg);
        setOtp(Array(OTP_LENGTH).fill(''));
      } else {
        toast.error(response?.data.msg);
      }
    } catch (err) {
      toast.error(err.response.data?.msg);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setTimeLeft(RESEND_TIME);
    setResendAvailable(false);
    inputsRef.current[0]?.focus();
    setError(null);

    try {
      const resp = await axios.post('http://localhost:7000/api/v1/resend-otp', { email });
      if (resp.data.success === true) {
        toast.success(resp.data.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className="w-full max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Enter OTP</h2>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-md transition ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </>
            ) : (
              'Submit OTP'
            )}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="text-sm text-gray-600 text-center">
            {resendAvailable ? (
              <button
                onClick={resendOtp}
                type="button"
                className="text-blue-600 cursor-pointer hover:underline mt-2"
              >
                Resend OTP
              </button>
            ) : (
              <p className="mt-2">Resend OTP in {timeLeft}s</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPForm;
