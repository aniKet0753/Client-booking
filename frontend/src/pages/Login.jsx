import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "../api"; // Assuming this axios instance is configured for your API base URL
import Loginbg from '../../public/Images/login-bg.jpg';

const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const [errorMessage, setErrorMessage] = useState(''); // Unified error message

  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Added reset to clear form on successful login
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true); // Start loading
    setErrorMessage(''); // Clear previous errors

    const payload = {
      identifier: data.identifier,
      password: data.password,
    };

    try {
      // Attempt Agent Login first
      const agentResponse = await axios.post("api/agents/login", payload, {
        headers: { "Content-Type": "application/json" }
      });

      // Agent login successful
      localStorage.setItem('Token', agentResponse.data.token);
      localStorage.setItem('role', agentResponse.data.role);
      localStorage.setItem('agentID', agentResponse.data.agentID);

      toast.success("Login successful!");
      reset();
      setTimeout(() => {
        if (agentResponse.data.role === 'superadmin') {
          navigate("/superadmin/dashboard");
        } else {
          navigate(location?.state ? location.state : "/agent/dashboard");
          window.location.reload(true);
        }
      }, 2000); // Shorter timeout for better UX

    } catch (agentError) {
      // If agent login fails, attempt Customer Login
      console.log(agentError.response.data.error)
      if (agentError.response.data.error !== 'User not found!') {
        toast.error(agentError.response.data.error);
      } else if (agentError.response.data.error === 'User not found!') {
        try {
          const customerResponse = await axios.post("/api/customer/login", payload, {
            headers: { "Content-Type": "application/json" }
          });

          // Customer login successful
          localStorage.setItem("Token", customerResponse.data.token); // Store customer token
          localStorage.setItem("role", "customer");
          localStorage.setItem("customerID", customerResponse.data.customerID);

          toast.success("Login successful!");
          reset(); // Clear form fields
          setTimeout(() => {
            navigate("/customer-dashboard"); // Navigate to customer dashboard or home
            window.location.reload(true);
          }, 2000);

        } catch (customerError) {
          // Both agent and customer login failed
          const errorMsg = customerError.response?.data?.error || "Login failed! Please check your credentials.";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="bg-[#E8F3FF] p-4 pt-7 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row max-w-[1440px] w-full overflow-hidden">
          {/* Left Side Image - Hidden on mobile, flex on md and up */}
          <div className="hidden md:flex flex-1 items-center justify-center p-6 bg-white flex-col">
            <img className="max-w-xs w-full h-auto" src={Loginbg} alt="Login Illustration" />
            <div className="mt-8 p-6 border-2 border-green-600 rounded-lg bg-green-50 text-center max-w-md mx-auto">
              <h3 className="text-3xl font-extrabold text-green-700 mb-4">Want to become an agent?</h3>
              <Link
                to="/agent-register"
                className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Sign up here
              </Link>
            </div>
          </div>

          {/* Right Side Form */}
          <div className="w-full md:w-1/2 p-8 lg:p-12">
            <h2 className="lg:text-6xl text-3xl font-bold text-[#113A5F] mb-2">Welcome Back!</h2>
            <p className="text-black text-lg mb-6">Sign in to continue your booking journey</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email or Phone */}
              <div>
                <label htmlFor="identifier" className="block text-xl font-medium text-[#113A5F] mb-2">Email or Phone</label>
                <input
                  id="identifier"
                  type="text"
                  {...register("identifier", { required: "Email or Phone is required" })}
                  className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Email or Phone number"
                  aria-invalid={errors.identifier ? "true" : "false"}
                />
                {errors.identifier && <span className="text-red-500 text-sm mt-1 block">{errors.identifier.message}</span>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xl font-medium text-[#113A5F] mb-2">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      //   minLength: {
                      //     value: 8,
                      //     message: "Password must be at least 8 characters long",
                      //   },
                    })}
                    className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 p-2"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <IoEyeOutline className="text-xl" /> : <IoEyeOffOutline className="text-xl" />}
                  </span>
                </div>
                {errors.password && <span className="text-red-500 text-sm mt-1 block">{errors.password.message}</span>}
              </div>

              <div className="text-right text-sm text-[#113A5F] underline font-medium hover:text-green-500">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#53974A] text-white text-2xl rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login now'}
              </button>
            </form>

            {errorMessage && (
              <div className="mt-4 text-center text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <p className="text-sm text-center mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <section className="bg-[#E8F3FF] py-10 px-6 lg:pt-[100px] lg:pb-[70px]">
        <div className="max-w-6xl mx-auto">
          <h2 className="lg:text-6xl text-3xl font-bold text-[#113A5F] mb-8 text-center lg:text-left">Need Help?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center text-center sm:items-start sm:text-left">
              <h3 className="font-bold text-xl text-black mb-2">24/7 Support</h3>
              <p className="text-black text-sm">Our travel experts are available round the clock to assist you.</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center text-center sm:items-start sm:text-left">
              <h3 className="font-bold text-xl text-black mb-2">Secure Booking</h3>
              <p className="text-black text-sm">Your payments and personal information are protected.</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center text-center sm:items-start sm:text-left">
              <h3 className="font-bold text-xl text-black mb-2">Best Price Guarantee</h3>
              <p className="text-black text-sm">Find a lower price? We’ll match it!</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;