
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mb-8 mx-auto">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-brand-100 to-purple-100 dark:from-brand-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
              ?
            </span>
          </div>
        </div>
        
        <h1 className="text-6xl font-extrabold hero-text-gradient mb-6">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/">
          <Button size="lg" className="bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
