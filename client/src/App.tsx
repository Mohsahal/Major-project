import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ResumeBuilder from "./pages/ResumeBuilder";
import SharedResume from "./pages/SharedResume";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import MyResumes from "./pages/MyResumes";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import FeaturesPage from "./pages/FeaturesPage";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";

import MockInterviewPage from "./pages/MockInterviewPage";
import NotFoundPage from "./pages/NotFoundPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ResumePreview from '@/pages/ResumePreview';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from "@/components/layout/MainLayout";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              <Routes>
                {/* Home page with header/footer */}
                <Route path="/" element={
                  <MainLayout>
                    <HomePage />
                  </MainLayout>
                } />
                {/* Other pages without header/footer */}
                <Route path="/about" element={
                  <MainLayout>
                    <AboutPage />
                  </MainLayout>
                } />
                <Route path="/features" element={
                  <MainLayout>
                    <FeaturesPage />
                  </MainLayout>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/shared-resume/:encodedData" element={<SharedResume />} />
                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  } />
                  <Route path="/dashboard/:feature" element={
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  } />
                  <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
                  <Route path="/resume-builder/:id" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
                  <Route path="/my-resumes" element={<ProtectedRoute><MyResumes /></ProtectedRoute>} />
                  <Route path="/mock-interview" element={<MockInterviewPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/resume-preview/:id" element={<ProtectedRoute><ResumePreview /></ProtectedRoute>} />
                </Route>
                {/* 404 Page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

