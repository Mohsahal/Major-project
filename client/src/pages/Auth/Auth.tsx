import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Facebook, Linkedin, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import AuthBackground from "@/components/auth/AuthBackground";
import SocialButton from "@/components/auth/SocialButton";
import AnimatedTransition from "@/components/auth/AnimatedTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleLogin } from '@react-oauth/google';

const Auth = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const { login, signup, isLoading, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Determine initial tab from location state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(loginData.email, loginData.password);
     
      navigate("/dashboard"); // Navigate to auth page with signup tab active
    } catch (error) {
      // Error handling is already done in the AuthContext
      console.error("Login error:", error);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!signupData.name || !signupData.email || !signupData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (signupData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      await signup(signupData.email, signupData.password, signupData.name);
      setActiveTab("login"); // Switch to login tab after successful signup
      navigate("/auth", { state: { activeTab: "login" } }); // Navigate to auth page with login tab active
    } catch (error) {
      // Error handling is already done in the AuthContext
      console.error("Signup error:", error);
    }
  };

  const handleGoogleSuccess = async (response) => {
    console.log('Google Sign-In Success:', response);
    
    try {
      // Get the access token from the response
      const accessToken = response.access_token;
      
      if (!accessToken) {
        throw new Error('No access token received from Google');
      }

      // Send the access token to your backend for verification and authentication
      const backendResponse = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          accessToken: accessToken 
        }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.message || 'Backend authentication failed');
      }

      const data = await backendResponse.json();
      console.log('Backend Authentication Success:', data);

      // Use the new loginWithGoogle function from AuthContext
      await loginWithGoogle(data.token, data.user);
      
      // If we're on the signup tab, show account created message and redirect to login
      if (activeTab === "signup") {
        toast({
          title: "Account Created",
          description: "Your account has been created successfully. Please sign in.",
        });
        setActiveTab("login");
        navigate("/auth", { state: { activeTab: "login" } });
      } else {
        // If we're on the login tab, redirect to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Backend authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Could not authenticate with backend.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In Failed');
    toast({
      title: "Google Sign-In Failed",
      description: "Could not sign in with Google. Please try again.",
      variant: "destructive",
    });
  };

  const initiateGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'implicit',
    scope: 'email profile'
  });

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Left Section - Green Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-5/12 bg-gradient-to-br from-[#A044F5] to-[#7c3aed] text-white relative overflow-hidden flex items-center justify-center p-8"
      >
        <AuthBackground />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-4">
         

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {activeTab === "login" ? "Welcome Back!" : "Hello, Friend!"}
            </h1>
            <p className="text-base md:text-lg mb-8 opacity-90 max-w-sm mx-auto">
              {activeTab === "login"
                ? "To keep connected with us please login with your personal info"
                : "Enter your personal details and start your journey with us"}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#A044F5] transition-all px-10 py-3 rounded-full text-lg font-semibold"
              >
                {activeTab === "login" ? "SIGN IN" : "SIGN UP"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section - White Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full md:w-7/12 bg-white flex items-center justify-center p-6 md:p-12"
      >
        <div className="w-full max-w-md">
          <AnimatedTransition>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                {activeTab === "login" ? "Sign in to Account" : "Create Account"}
              </h2>
              <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                className="flex justify-center space-x-4 mb-6"
              >
                <SocialButton icon={<Facebook size={20} />} />
                <SocialButton icon={<span className="text-lg font-bold">G+</span>} onClick={() => initiateGoogleLogin()} />
                <SocialButton icon={<Linkedin size={20} />} />
              </motion.div>
              <p className="text-gray-600 text-sm">
                or use your email {activeTab === "login" ? "for login" : "for registration"}:
              </p>
            </div>
          </AnimatedTransition>

          {activeTab === "login" ? (
            <motion.form
              variants={formVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleLoginSubmit}
              className="space-y-5"
            >
              <motion.div variants={itemVariants} className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="pl-12 py-6 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-[#A044F5] focus-visible:ring-offset-0"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="pl-12 py-6 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-[#A044F5] focus-visible:ring-offset-0"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/forgot-password" className="text-gray-600 text-sm hover:text-[#A044F5] transition-colors">
                    Forgot your password?
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#A044F5] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#A044F5] text-white py-6 rounded-full text-lg font-semibold transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : "SIGN IN"}
                </Button>
              </motion.div>

            </motion.form>
          ) : ( // Signup form
            <motion.form
              variants={formVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSignupSubmit}
              className="space-y-5"
            >
               <motion.div variants={itemVariants} className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  name="name"
                  type="text"
                  placeholder="Name"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  className="pl-12 py-6 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-[#A044F5] focus-visible:ring-offset-0"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  className="pl-12 py-6 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-[#A044F5] focus-visible:ring-offset-0"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  className="pl-12 py-6 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-[#A044F5] focus-visible:ring-offset-0"
                  required
                />
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                 <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#A044F5] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#A044F5] text-white py-6 rounded-full text-lg font-semibold transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : "SIGN UP"}
                </Button>
              </motion.div>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

