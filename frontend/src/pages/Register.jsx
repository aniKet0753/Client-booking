import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loginbg from "../../public/Images/login-bg.jpg";
import axios from "../api";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { FiPhone, FiAlertCircle } from "react-icons/fi";

const Register = () => {
  const [showPass, setShowPass] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = useForm();

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const email = getValues("email");
      if (!email) {
        toast.error("Please enter a valid email address first.", {
          autoClose: 3000,
        });
        return;
      }
      await axios.post(
        "/api/otp/send-otp",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("OTP sent to your email!", { autoClose: 3000 });
      setIsOtpSent(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Try again.",
        { autoClose: 3000 }
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    try {
      const email = getValues("email");
      await axios.post(
        "/api/otp/verify-otp",
        { email, otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("OTP verified successfully!", { autoClose: 3000 });
      setIsOtpVerified(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "OTP verification failed. Please check the code.",
        { autoClose: 3000 }
      );
      setIsOtpVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (data) => {
    if (!isOtpVerified) {
      toast.error("Please verify your email address first.", {
        autoClose: 3000,
      });
      return;
    }

    try {
      await axios.post(
        "/api/customer/register",
        {
          name: data.name,
          email: data.email,
          phone: data.phone_calling,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Account created successfully!", { autoClose: 3000 });
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed. Try again.",
        { autoClose: 3000 }
      );
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-100 p-4 pt-7">
      <ToastContainer autoClose={3000} />

      <div className="bg-white rounded-lg shadow-lg flex max-w-[1440px] w-full overflow-hidden mx-auto">
        {/* Left Side Image */}
        <div className="hidden md:flex flex-1 items-center justify-center p-6 bg-white flex-col">
          <img className="max-w-xs" src={Loginbg} alt="Register Illustration" />
          <div className="mt-10 p-6 border-2 border-green-600 rounded-lg bg-green-50 text-center">
            <h3 className="text-3xl font-extrabold text-green-700 mb-4">
              Want to become an agent?
            </h3>
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
          <h2 className="lg:text-6xl text-3xl font-bold text-[#113A5F] mb-2">
            Join Us Now!
          </h2>
          <p className="text-black text-xl mb-6">
            Customers are requested to sign up for exploring unrestricted access
            of tours
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xl font-medium text-[#113A5F] mb-2">
                Full Name
              </label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <span className="text-red-500 text-xs">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Email Address with OTP */}
            <div>
              <label className="block text-xl font-medium text-[#113A5F] mb-2">
                Email address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="flex-1 px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Email address"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="flex items-center justify-center px-4 py-2 mt-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isSendingOtp ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 
                          0 5.373 0 12h4zm2 5.291A7.962 
                          7.962 0 014 12H0c0 3.042 1.135 
                          5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : isOtpSent ? (
                    "Resend OTP"
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
              {errors.email && (
                <span className="text-red-500 text-xs">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Verify OTP Field */}
            {isOtpSent && (
              <div className="space-y-4">
                <label className="block text-xl font-medium text-[#113A5F] mb-2">
                  Verify OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter OTP"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifying}
                    className="flex items-center justify-center px-4 py-2 mt-1 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {isVerifying ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 
                            018-8V0C5.373 0 0 5.373 0 
                            12h4zm2 5.291A7.962 7.962 
                            0 014 12H0c0 3.042 1.135 
                            5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Phone Number */}
            <div className="mb-4">
              <label className="bblock text-xl font-medium text-[#113A5F] mb-2">
                Phone No
              </label>
              <div className="relative">
                <Controller
                  name="phone_calling"
                  control={control}
                  rules={{ required: "Phone number is required" }}
                  render={({ field }) => (
                    <PhoneInput
                      {...field}
                      international
                      defaultCountry="IN"
                      className={`border ${
                        errors.phone_calling
                          ? "border-red-400"
                          : "border-black"
                      } w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter phone number"
                    />
                  )}
                />
              </div>
              {errors.phone_calling && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" />{" "}
                  {errors.phone_calling.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xl font-medium text-[#113A5F] mb-2">
                Password{" "}
                <span className="text-gray-400 text-sm">
                  (Minimum 8 characters)
                </span>
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create your password"
                  type={showPass ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
                      message:
                        "Password must be at least 8 characters, include one uppercase, one lowercase, and one special character",
                    },
                  })}
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-500"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? (
                    <IoEyeOutline className="text-xl mt-2" />
                  ) : (
                    <IoEyeOffOutline className="text-xl mt-2" />
                  )}
                </span>
              </div>
              {errors.password && (
                <span className="text-red-500 text-xs">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className={`w-full py-3 text-white text-2xl rounded-lg font-semibold transition ${
                isOtpVerified
                  ? "bg-[#53974A] hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!isOtpVerified}
            >
              Register now
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
