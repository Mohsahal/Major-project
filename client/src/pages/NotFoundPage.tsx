import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center max-w-md w-full">
        {/* Icon */}
        <div className="mb-6">
          <svg
            className="mx-auto h-20 w-20 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.658-1.14 1.105-2.05L13.105 4.05c-.553-.91-1.658-.91-2.211 0L2.977 16.95c-.553.91.051 2.05 1.105 2.05z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold text-gray-800">404</h1>

        {/* Message */}
        <p className="mt-3 text-lg text-gray-600">
          Oops! The page you’re looking for doesn’t exist.
        </p>
        <p className="text-sm text-gray-500">
          It might have been moved or deleted.
        </p>

        {/* Button */}
        <div className="mt-6">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
