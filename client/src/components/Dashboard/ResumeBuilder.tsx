import { Link } from 'react-router-dom'
import { ArrowRight, FileCheck, FileText, Plus, Sparkles, Upload, Download, Share2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

function ResumeBuilder() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resume Builder</h2>
          <p className="text-gray-600 mt-1">Create professional resumes with AI assistance</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/my-resumes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Resumes
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/resume-builder" className="flex items-center gap-2">
              Go to Builder
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Resume Builder Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Create Your Professional Resume</CardTitle>
                <p className="text-gray-600 text-sm">AI-powered templates and smart suggestions</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all">
              <Plus className="h-6 w-6 text-blue-600" />
              <span className="font-medium">New Resume</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all">
              <Upload className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Import PDF</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Templates</span>
            </Button>
          </div>

          {/* Resume Preview Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Recent Resume</h4>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 px-3">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-16 bg-blue-100 rounded flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">Software Engineer Resume</h5>
                <p className="text-sm text-gray-600">Last updated: 2 days ago</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">Professional</Badge>
                  <Badge variant="outline" className="text-xs">2 pages</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-4">
            <Button size="lg" className="px-8 py-3 text-base font-medium" asChild>
              <Link to="/resume-builder" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Start Building Resume
              </Link>
            </Button>
            <p className="text-sm text-gray-500 mt-2">Free templates • AI suggestions • Export to PDF</p>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center p-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Professional Templates</h4>
          <p className="text-sm text-gray-600">Choose from 20+ industry-specific designs</p>
        </Card>
        
        <Card className="text-center p-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-medium text-gray-900 mb-1">AI Suggestions</h4>
          <p className="text-sm text-gray-600">Smart content recommendations</p>
        </Card>
        
        <Card className="text-center p-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Download className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Multiple Formats</h4>
          <p className="text-sm text-gray-600">PDF, Word, and HTML export</p>
        </Card>
        
        <Card className="text-center p-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Share2 className="h-6 w-6 text-orange-600" />
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Easy Sharing</h4>
          <p className="text-sm text-gray-600">Share directly with employers</p>
        </Card>
      </div>
    </div>
  )
}

export default ResumeBuilder
