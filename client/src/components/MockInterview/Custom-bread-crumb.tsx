import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadCrumbItem {
  label: string;
  link: string;
}

interface CustomBreadCrumbProps {
  breadCrumbPage: string;
  breadCrumpItems: BreadCrumbItem[];
  className?: string;
}

export const CustomBreadCrumb = ({ 
  breadCrumbPage, 
  breadCrumpItems, 
  className 
}: CustomBreadCrumbProps) => {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      <Link to="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      
      {breadCrumpItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          <Link 
            to={item.link} 
            className="hover:text-foreground transition-colors"
          >
            {item.label}
          </Link>
        </div>
      ))}
      
      <div className="flex items-center space-x-1">
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{breadCrumbPage}</span>
      </div>
    </nav>
  );
};
  