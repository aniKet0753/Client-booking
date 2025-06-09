import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaQuestionCircle } from 'react-icons/fa';
import { GiAstronautHelmet, GiSpaceship } from 'react-icons/gi';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract page name from URL
  const pageName = location.pathname.split('/').pop().replace(/-/g, ' ') || 'this page';
  const formattedPageName = pageName === '' ? 'home' : pageName;

  useEffect(() => {
    document.title = `404 - ${formattedPageName.charAt(0).toUpperCase() + formattedPageName.slice(1)} Not Found`;
  }, [formattedPageName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Banner with dynamic page name */}
      <div className="w-full max-w-4xl bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg mb-8 overflow-hidden">
        <div className="p-6 text-center">
          <div className="flex justify-center items-center gap-4">
            <FaQuestionCircle className="text-white text-4xl" />
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              404 - {formattedPageName.charAt(0).toUpperCase() + formattedPageName.slice(1)} Not Found
            </h1>
          </div>
          <p className="text-blue-100 text-lg mt-2">
            Oops! The {formattedPageName} you're looking for doesn't exist
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row items-center gap-8">
          {/* Illustration side */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20"></div>
              <div className="relative flex flex-col items-center">
                <GiAstronautHelmet className="text-8xl text-blue-600 animate-float" />
                <GiSpaceship className="text-4xl text-purple-500 mt-4 animate-float" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          </div>

          {/* Text content with dynamic page name */}
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <GiAstronautHelmet className="text-blue-500" />
              {formattedPageName.charAt(0).toUpperCase() + formattedPageName.slice(1)} is lost in space!
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find the {formattedPageName} you requested. It might have been moved or deleted, 
              or maybe you mistyped the address.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
              >
                <FaArrowLeft />
                Return to Previous Page
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
              >
                <FaHome />
                Go to Homepage
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex items-start gap-2">
              <FaQuestionCircle className="text-gray-400 mt-1" />
              <p className="text-gray-500 text-sm">
                Looking for {formattedPageName}? Contact support if you believe this is an error.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ErrorPage;