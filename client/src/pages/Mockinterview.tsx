import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  CheckCircle, 
  BarChart2, 
  Zap, 
  ArrowRight, 
  Star, 
  Clock, 
  Target, 
  Play,
  Pause,
  SkipForward,
  Volume2,
  Settings,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Headphones,
  Brain,
  Target as TargetIcon,
  Calendar,
  Timer
} from 'lucide-react';

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('technical');

  // Auto-advance slides with improved timing
  useEffect(() => {
    // Start auto-play automatically
    setIsPlaying(true);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentSlide(prev => (prev + 1) % 4);
          return 0;
        }
        return prev + 1.5; // Slower progress for better user experience
      });
    }, 80); // Faster updates for smoother progress bar
    
    return () => clearInterval(interval);
  }, []); // Remove isPlaying dependency to make it always auto-play

  const slides = [
    {
      title: "AI-Powered Mock Interviews",
      subtitle: "Practice with confidence using our advanced interview simulator",
      icon: <Brain className="h-16 w-16 text-blue-600" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-white"
    },
    {
      title: "Real-time Voice Analysis",
      subtitle: "Get instant feedback on your speaking skills and confidence",
      icon: <Mic className="h-16 w-16 text-green-600" />,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-white"
    },
    {
      title: "Personalized Learning Path",
      subtitle: "Adaptive questions based on your performance and goals",
      icon: <TargetIcon className="h-16 w-16 text-purple-600" />,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-white"
    },
    {
      title: "Progress Tracking & Analytics",
      subtitle: "Monitor your improvement with detailed insights and reports",
      icon: <TrendingUp className="h-16 w-16 text-orange-600" />,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-white"
    }
  ];

  const categories = [
    {
      id: 'technical',
      name: 'Technical Interviews',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-white text-blue-700 border-blue-200',
      questions: 150,
      difficulty: 'Advanced'
    },
    {
      id: 'behavioral',
      name: 'Behavioral Questions',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-white text-green-700 border-green-200',
      questions: 200,
      difficulty: 'Intermediate'
    },
    {
      id: 'hr',
      name: 'HR & Screening',
      icon: <Star className="h-6 w-6" />,
      color: 'bg-white text-purple-700 border-purple-200',
      questions: 100,
      difficulty: 'Beginner'
    },
    {
      id: 'custom',
      name: 'Custom Scenarios',
      icon: <Target className="h-6 w-6" />,
      color: 'bg-white text-orange-700 border-orange-200',
      questions: 50,
      difficulty: 'Expert'
    }
  ];

  const stats = [
    { label: 'Questions Available', value: '500+', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Practice Sessions', value: '10,000+', icon: <Headphones className="h-5 w-5" /> },
    { label: 'Success Rate', value: '94%', icon: <Award className="h-5 w-5" /> },
    { label: 'Active Users', value: '25K+', icon: <Users className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Slider */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          {/* Slider Controls */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-full w-12 h-12 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentSlide((prev) => (prev + 1) % 4);
                setProgress(0);
              }}
              className="rounded-full w-12 h-12 p-0"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Slide {currentSlide + 1} of 4</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Main Slider */}
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${slides[currentSlide].bgColor} border-2 border-gray-200 shadow-sm mb-8`}>
                  {slides[currentSlide].icon}
                </div>
                <h1 className={`text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${slides[currentSlide].color} mb-6`}>
                  {slides[currentSlide].title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
                  {slides[currentSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <Link to="/interview">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Practice Interview
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setProgress(0);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-indigo-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
        
        {/* Auto-play Status */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded-full text-sm font-medium border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Auto-playing slides
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 mb-24"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-md mb-3 border border-gray-200">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Interview Categories */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 mb-24"
      >
        <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Choose Your Interview Category
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              <Card className={`border-2 transition-all duration-300 ${
                selectedCategory === category.id 
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${category.color} mb-4`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{category.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Questions:</span>
                      <span className="font-medium">{category.questions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <Badge variant="outline" className="text-xs">{category.difficulty}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 mb-24"
      >
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div
            whileHover={{ y: -5 }}
            className="text-center"
          >
            <Card className="bg-white shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 h-full">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-white border-2 border-indigo-200 flex items-center justify-center mb-6 mx-auto">
                  <Mic className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Voice-Based Practice</h3>
                <p className="text-gray-600 leading-relaxed">
                  Answer interview questions naturally with your voice. Experience real-time transcription and get comfortable with speaking confidently.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="text-center"
          >
            <Card className="bg-white shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 h-full">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-white border-2 border-green-200 flex items-center justify-center mb-6 mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Instant Feedback</h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive detailed feedback on your responses, including strengths, areas for improvement, and actionable suggestions.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="text-center"
          >
            <Card className="bg-white shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 h-full">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-white border-2 border-purple-200 flex items-center justify-center mb-6 mx-auto">
                  <BarChart2 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Progress Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track your improvement over time with detailed analytics and performance metrics.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Final CTA Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 mb-24"
      >
        <div className="text-center">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Interview?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of professionals who have improved their interview skills with our AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/interview">
                  <Button 
                    size="lg"
                    variant="secondary"
                    className="px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Free Practice
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg"
                  variant="secondary"
                  className="px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Customize Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 text-lg mb-2">© 2024 AI Interview Simulator</p>
          <p className="text-gray-500">Your AI-powered interview preparation partner</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
