import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const LoginPrompt = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full">
          <FiLogIn className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Restricted Access
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please authenticate to view this content
          </p>
        </div>
        
        <div className="flex flex-col space-y-4 pt-2">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FiLogIn className="h-5 w-5" />
            Sign In to Continue
          </button>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="h-px w-8 bg-gray-300 dark:bg-gray-600"></span>
            <span>or</span>
            <span className="h-px w-8 bg-gray-300 dark:bg-gray-600"></span>
          </div>
          
          <button
            onClick={() => navigate('/register')}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-300"
          >
            <FiUserPlus className="h-5 w-5" />
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;