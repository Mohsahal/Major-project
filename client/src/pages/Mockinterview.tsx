import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Mic, CheckCircle, BarChart2, Zap, ArrowRight, Star, Clock, Target } from 'lucide-react';

const Index = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
            Master Your Interview Skills
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            Practice with AI-powered mock interviews. Get instant feedback and 
            improve your chances of landing your dream job.
          </p>
          
          <Link to="/interview">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Practice Interview
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-24 grid md:grid-cols-3 gap-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-none hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 mx-auto">
                <Mic className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800">Voice-Based Practice</h3>
              <p className="text-center text-gray-600 leading-relaxed">
                Answer interview questions naturally with your voice. Experience real-time transcription and get comfortable with speaking confidently.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-none hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center mb-6 mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800">Instant Feedback</h3>
              <p className="text-center text-gray-600 leading-relaxed">
                Receive detailed feedback on your responses, including strengths, areas for improvement, and actionable suggestions.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-none hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-6 mx-auto">
                <BarChart2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800">Progress Tracking</h3>
              <p className="text-center text-gray-600 leading-relaxed">
                Track your improvement over time with detailed analytics and performance metrics.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-24"
        >
          <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Interview Categories
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-none hover:shadow-xl transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Technical</h3>
              <p className="text-gray-600">
                Programming, system design, and technical knowledge questions.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-none hover:shadow-xl transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">HR / Screening</h3>
              <p className="text-gray-600">
                Background, motivation, and general fit questions.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-none hover:shadow-xl transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Behavioral</h3>
              <p className="text-gray-600">
                Past experiences, workplace situations, and soft skills.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-none hover:shadow-xl transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Custom</h3>
              <p className="text-gray-600">
                Specialized questions for your specific industry or role.
              </p>
            </motion.div>
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/interview">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Begin Your Interview Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
      
      <footer className="bg-white/80 backdrop-blur-sm py-12 mt-24 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 text-lg mb-2">© 2024 Mock Interview Simulator</p>
          <p className="text-gray-500">Your AI-powered interview preparation partner</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
