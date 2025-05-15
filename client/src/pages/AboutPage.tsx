
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  Calendar,
  Lightbulb,
  GraduationCap,
  ThumbsUp,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react';

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('mission');
  
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-purple-600">
            About FutureFind
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Transforming the way job seekers prepare, apply, and succeed in their career journeys with intelligent AI-powered tools.
          </p>
        </motion.div>
        
        {/* Mission & Values Tabs */}
        <Tabs 
          defaultValue="mission" 
          className="w-full max-w-4xl mx-auto"
          onValueChange={(value) => setActiveTab(value)}
        >
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="mission">Our Mission</TabsTrigger>
              <TabsTrigger value="story">Our Story</TabsTrigger>
              <TabsTrigger value="values">Our Values</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="mission" className="mt-2">
            <motion.div
              initial="hidden"
              animate={activeTab === 'mission' ? 'visible' : 'hidden'}
              variants={containerVariants}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md"
            >
              <motion.div variants={itemVariants} className="flex items-center mb-6">
                <div className="mr-4 p-3 rounded-full bg-brand-50 dark:bg-brand-900/20">
                  <BookOpen className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h2 className="text-2xl font-semibold">Our Mission</h2>
              </motion.div>
              
              <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                At FutureFind, we're on a mission to democratize career advancement opportunities through AI-powered tools that level the playing field for all job seekers.
              </motion.p>
              
              <motion.div variants={itemVariants} className="mb-8">
                <h3 className="text-xl font-medium mb-4">What We Aim To Achieve</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Help 1 million job seekers secure their dream jobs by 2026
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Reduce preparation time for interviews by 75%
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Bridge skill gaps through AI-driven personalized learning
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Make professional career coaching accessible to everyone
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="story" className="mt-2">
            <motion.div
              initial="hidden"
              animate={activeTab === 'story' ? 'visible' : 'hidden'}
              variants={containerVariants}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md"
            >
              <motion.div variants={itemVariants} className="flex items-center mb-6">
                <div className="mr-4 p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold">Our Story</h2>
              </motion.div>
              
              <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                FutureFind was founded in 2023 by a team of AI engineers, HR professionals, and career coaches who recognized a fundamental problem in the job market: talented individuals were struggling to showcase their abilities effectively.
              </motion.p>
              
              <motion.div variants={itemVariants} className="mb-8 space-y-8">
                <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-brand-500"></div>
                  <h4 className="font-semibold text-brand-600 dark:text-brand-400">2023</h4>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Founded in San Francisco with a vision to transform career advancement through AI</p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-brand-500"></div>
                  <h4 className="font-semibold text-brand-600 dark:text-brand-400">2024</h4>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Launched our core platform with Resume Builder and Mock Interview features</p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-brand-500"></div>
                  <h4 className="font-semibold text-brand-600 dark:text-brand-400">2025</h4>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Expanding globally with new skill analysis and job matching algorithms</p>
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="values" className="mt-2">
            <motion.div
              initial="hidden"
              animate={activeTab === 'values' ? 'visible' : 'hidden'}
              variants={containerVariants}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md"
            >
              <motion.div variants={itemVariants} className="flex items-center mb-6">
                <div className="mr-4 p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold">Our Values</h2>
              </motion.div>
              
              <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Our core values guide everything we do at FutureFind, from product development to customer support.
              </motion.p>
              
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <ThumbsUp className="h-5 w-5 text-brand-600 mr-3" />
                      <h3 className="text-lg font-medium">Accessibility</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Making career advancement tools accessible to everyone, regardless of background or experience level.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Award className="h-5 w-5 text-brand-600 mr-3" />
                      <h3 className="text-lg font-medium">Excellence</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Committed to delivering the highest quality tools and resources that truly make a difference.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Users className="h-5 w-5 text-brand-600 mr-3" />
                      <h3 className="text-lg font-medium">Community</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Building a supportive community where job seekers can learn, grow, and succeed together.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Briefcase className="h-5 w-5 text-brand-600 mr-3" />
                      <h3 className="text-lg font-medium">Innovation</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Constantly pushing the boundaries of what's possible with AI to solve real career challenges.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>
      
      {/* Team Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900/50 rounded-3xl mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The passionate minds behind FutureFind working to transform career advancement
          </p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {/* Team Member 1 */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
            <div className="h-48 bg-gradient-to-r from-purple-500 to-brand-500 flex items-center justify-center">
              <Users className="h-20 w-20 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-1">Alex Chen</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-3">Co-Founder & CEO</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Former HR Tech executive with a passion for creating equitable access to career opportunities.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.div>
          
          {/* Team Member 2 */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
            <div className="h-48 bg-gradient-to-r from-brand-500 to-blue-500 flex items-center justify-center">
              <Users className="h-20 w-20 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-1">Maya Johnson</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-3">Co-Founder & CTO</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                AI researcher with expertise in natural language processing and conversational interfaces.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.div>
          
          {/* Team Member 3 */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Users className="h-20 w-20 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-1">David Park</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-3">Head of Product</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Career coach turned product leader with 10+ years of experience in career development.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Measuring our success by the success of those we help
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center"
          >
            <p className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">75k+</p>
            <p className="text-gray-600 dark:text-gray-300">Successful Job Placements</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center"
          >
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">250k+</p>
            <p className="text-gray-600 dark:text-gray-300">Mock Interviews Conducted</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center"
          >
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">92%</p>
            <p className="text-gray-600 dark:text-gray-300">User Success Rate</p>
          </motion.div>
        </div>
      </section>
      
      {/* Partners & Recognitions */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900/50 rounded-3xl mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Partners & Recognitions</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Proudly collaborating with industry leaders and recognized for our innovation
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-24">
            <Badge variant="outline" className="text-lg py-3 px-4 border-2">Partner One</Badge>
          </div>
          <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-24">
            <Badge variant="outline" className="text-lg py-3 px-4 border-2">Partner Two</Badge>
          </div>
          <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-24">
            <Badge variant="outline" className="text-lg py-3 px-4 border-2">Partner Three</Badge>
          </div>
          <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-24">
            <Badge variant="outline" className="text-lg py-3 px-4 border-2">Partner Four</Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          <Badge className="text-sm py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
            HR Tech Innovation Award 2024
          </Badge>
          <Badge className="text-sm py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            Best AI Career Tool
          </Badge>
          <Badge className="text-sm py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Top Startup to Watch
          </Badge>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-brand-600 to-purple-600 p-12 rounded-3xl max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Transform Your Career?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful job seekers who have accelerated their careers with FutureFind's AI-powered tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-brand-600 hover:bg-gray-100" size="lg">
              <GraduationCap className="mr-2 h-5 w-5" />
              Sign Up Free
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/20" size="lg">
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;




