import { useState, useEffect, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';

// Define props interface for Header
interface HeaderProps {
  // showShadow?: boolean; // Removed this prop
  scrollContainerRef?: RefObject<HTMLElement>; // Added optional ref prop
}

// Accept showShadow prop
const Header = ({ scrollContainerRef }: HeaderProps) => { // Destructure scrollContainerRef
  const [isScrolled, setIsScrolled] = useState(false); // Keep internal scroll state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Change header style on scroll based on the provided ref or window
  useEffect(() => {
    const handleScroll = (target: HTMLElement | Window) => {
      const scrollTop = target === window ? window.scrollY : (target as HTMLElement).scrollTop; // Get scroll position
      if (scrollTop > 10) { // Check if scrolled more than 10px
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const scrollElement = scrollContainerRef?.current || window; // Use provided ref or window

    // Add event listener
    scrollElement.addEventListener('scroll', () => handleScroll(scrollElement));

    // Initial check in case the page is already scrolled on load
    handleScroll(scrollElement);

    // Clean up event listener
    return () => {
      scrollElement.removeEventListener('scroll', () => handleScroll(scrollElement));
    };
  }, [scrollContainerRef]); // Re-run effect if scrollContainerRef changes

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { text: "Home", path: "/" },
    { text: "Features", path: "/features" },
    { text: "Dashboard", path: "/dashboard", authRequired: true },
    { text: "About", path: "/about" }
  ];

  // Filter menu items based on authentication status
  const filteredNavItems = navItems.filter(item => 
    !item.authRequired || (item.authRequired && isAuthenticated)
  );

  return (
    // Apply shadow based on internal isScrolled state
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A044F5] to-[#7c3aed] flex items-center justify-center animate-pulse ">
              <span className="text-white font-bold text-lg">FF</span>
            </div>
            <span className="font-bold text-lg sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#A044F5] to-[#7c3aed]">
              FutureFind
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {filteredNavItems.map((item) => (
              <Link 
                key={item.text}
                to={item.path}
                className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
              >
                {item.text}
              </Link>
            ))}
          </nav>

          {/* Auth/Profile Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                        alt={user?.name || ""} 
                      />
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth" state={{ activeTab: 'login' }}>
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/auth" state={{ activeTab: 'signup' }}>
                  <Button variant="default">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Open menu">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 bg-white dark:bg-gray-900 rounded-b-lg shadow-lg animate-slide-up">
            <nav className="flex flex-col space-y-4 px-4">
              {filteredNavItems.map((item) => (
                <Link 
                  key={item.text}
                  to={item.path} 
                  className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.text}
                </Link>
              ))}
              {isAuthenticated ? (
                <Button variant="ghost" className="justify-start px-2" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/auth" state={{ activeTab: 'login' }} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/auth" state={{ activeTab: 'signup' }} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
