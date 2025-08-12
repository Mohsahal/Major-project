import { Link } from "react-router-dom";
import { User, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function Header() {
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
  };

  const handleSwitchAccount = () => {
    toast({
      title: "Switch Account",
      description: "Please logout first to switch accounts.",
      variant: "destructive",
    });
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
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
          <nav className="hidden md:flex space-x-8 mr-24">
            <Link to="/generate/questions" className="text-gray-700 hover:text-indigo-600 transition-colors duration-200">
              Questions
            </Link>
           
            <Link to="/generate/resources" className="text-gray-700 hover:text-indigo-600 transition-colors duration-200">
              Resources
            </Link>
            <Link to="/generate/about" className="text-gray-700 hover:text-indigo-600 transition-colors duration-200">
              About
            </Link>
          </nav>

          {/* User Profile and Logout */}
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          
              
            
          </div>
        </div>
      </div>
    </header>
  );
}
