import { Link } from "react-router-dom";
import { User, Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200 ">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/generate" className="flex items-center space-x-2">
            <img
              src="/images/interview.jpg"
              alt="MockInterview"
              className="h-14 w-14 mt-2"
            />
            <span className="text-xl font-bold text-gray-800">
              MockInterview
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/generate/questions" className="text-gray-700 hover:text-indigo-600">
              Questions
            </Link>
           
            <Link to="/generate/resources" className="text-gray-700 hover:text-indigo-600">
              Resources
            </Link>
            <Link to="/generate/about" className="text-gray-700 hover:text-indigo-600">
              About
            </Link>
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button className="md:hidden">
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
