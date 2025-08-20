import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loginbg from '../../public/Images/login-bg.jpg';
import axios from '../api';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Register = () => {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    axios.post('/api/customer/register',
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then(response => {
        toast.success("Account created successfully!", { autoClose: 3000 });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      })
      .catch(error => {
        toast.error(error.response?.data?.message || "Registration failed. Try again.", {
          autoClose: 3000,
        });
      });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-100 p-4 pt-7">
      <ToastContainer autoClose={3000} />

      <div className="bg-white rounded-lg shadow-lg flex max-w-[1440px] w-full overflow-hidden">
        {/* Left Side Image */}
        <div className="hidden md:flex flex-1 items-center justify-center p-6 bg-white flex-col">
          <img className="max-w-xs" src={Loginbg} alt="Register Illustration" />
          <div className="mt-10 p-6 border-2 border-green-600 rounded-lg bg-green-50 text-center">
            <h3 className="text-3xl font-extrabold text-green-700 mb-4">Want to become an agent?</h3>
            {/* <p className="text-green-800 mb-6 text-lg">
              Join our network of expert travel agents. Help others book unforgettable journeys while you grow!
            </p> */}
            <Link
              to="/agent-register"
              className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Become an Agent
            </Link>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="lg:text-6xl text-3xl font-bold text-[#113A5F] mb-2">Join Us Now!</h2>
          <p className="text-black text-xl mb-6">Sign up to start your booking journey</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xl font-medium text-[#113A5F] mb-2">Full Name</label>
              <input
                type="text"
                {...register("name", { required: true })}
                className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
              {errors.name && <span className="text-red-500 text-xs">This field is required</span>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xl font-medium text-[#113A5F] mb-2">Email address</label>
              <input
                type="email"
                {...register("email", { required: true })}
                className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your Email address"
              />
              {errors.email && <span className="text-red-500 text-xs">This field is required</span>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xl font-medium text-[#113A5F] mb-2">Phone Number</label>
              <input
                type="tel"
                {...register("phone", {
                  required: true,
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be 10 digits"
                  }
                })}
                className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
                maxLength={10}
                minLength={10}
              />
              {errors.phone && (
                <span className="text-red-500 text-xs">
                  {errors.phone.message || "This field is required"}
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xl font-medium text-[#113A5F] mb-2">Password <span className="text-gray-400 text-sm">(Minimum 8 characters)</span></label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create your password"
                  type={showPass ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/,
                      message:
                        "Password must be at least 6 characters, include one uppercase, one lowercase, and one special character",
                    },
                  })}
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-500"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <IoEyeOutline className="text-xl mt-2" /> : <IoEyeOffOutline className="text-xl mt-2" />}
                </span>
              </div>
              {errors.password && <span className="text-red-500 text-xs">Password must be at least 6 characters, include one uppercase, one lowercase, and one special character</span>}
            </div>

            {/* Register Button */}
            <button type="submit" className="w-full py-3 bg-[#53974A] text-white text-2xl rounded-lg font-semibold hover:bg-green-700">
              Register now
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;