import { useState } from 'react';
import { FaLock, FaUserShield, FaEye, FaEyeSlash, FaSignInAlt, FaSpinner } from 'react-icons/fa';
import axios from '../api';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Removed useLocation as it's not used
import { useDashboard } from '../context/DashboardContext'; // Import the useDashboard hook

const LoginPage = () => {
    // State variables for form inputs and UI feedback
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false); // Consider if you actually need this for state or just for UX
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // React Router hooks
    const navigate = useNavigate();

    // Get the handleLoginSuccess function from the DashboardContext
    const { handleLoginSuccess } = useDashboard();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        setErrorMessage("");

        const payload = {
            identifier: email,
            password: password,
        };

        try {
            // Attempt to login as an agent (which includes superadmins)
            const response = await axios.post("/api/agents/login", payload, {
                headers: { "Content-Type": "application/json" },
            });

            // Check if the logged-in user's role is 'superadmin'
            if (response.data.role === "superadmin") {
                localStorage.setItem("Token", response.data.token);
                localStorage.setItem("role", response.data.role);
                localStorage.setItem("agentID", response.data.agentID); // Consider if agentID is always present or needed

                // Call the handleLoginSuccess function from context
                // This will update the context's internal token/role states and trigger re-fetching
                handleLoginSuccess();

                toast.success("Superadmin login successful!");

                setTimeout(() => {
                    navigate("/superadmin/dashboard");
                }, 500);
            } else {
                // If login was successful but the role is NOT superadmin, deny access.
                setErrorMessage("Access denied! Only superadmins can log in here.");
                toast.error("Access denied! Only superadmins can log in here.");
                // Ensure local storage is clear if an invalid role was somehow set
                localStorage.removeItem("Token");
                localStorage.removeItem("role");
                localStorage.removeItem("agentID");
            }

        } catch (error) {
            // Handle any login errors
            const errorMsg = error.response?.data?.error || "Login failed! Please check your credentials.";
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <FaUserShield className="h-16 w-16 text-indigo-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Superadmin Login
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your superadmin credentials to access your account
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {errorMessage && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FaLock className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{errorMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="your@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="h-5 w-5" />
                                        ) : (
                                            <FaEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <FaSignInAlt className="mr-2" />
                                        Sign in
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Secure access only
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;