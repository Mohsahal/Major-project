import { Link } from 'react-router-dom'
import { ArrowRight, FileCheck, FileText } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'

function ResumeBuilder() {
  return (
    <div>
      <div className="flex justify-between items-center mt-9">
        <h2 className="text-xl font-semibold">Resume Builder</h2>
        <div className="flex gap-4">
          <Link to="/my-resumes" className="text-sm text-brand-blue flex items-center p-4 hover:underline">
            My Resumes <FileText className="ml-1 h-4 w-4" />
          </Link>
          <Link to="/resume-builder" className="text-sm text-brand-blue flex items-center p-4 hover:underline">
            Go to builder <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
      <Card className="bg-gradient-to-br from-white to-gray-100">
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <h3 className="font-semibold">Create or update your resume</h3>
            <p className="text-gray-600 text-sm mt-1">Use our AI-powered resume builder to create professional resumes</p>
            <div className="mt-4">
              <Button asChild>
                <Link to="/resume-builder">Build Resume</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <FileCheck className="h-24 w-24 text-gray-300" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResumeBuilder
