import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BriefcaseIcon, 
  FileText, 
  GraduationCap, 
  Mic, 
  User,
  ChevronLeft,
  ChevronRight,
  Cog
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SidebarItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  const sidebarItems: SidebarItem[] = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "#",
      active: activeItem === "dashboard",
    },
    {
      icon: <BriefcaseIcon className="h-5 w-5" />,
      label: "Job Recommendations",
      href: "#job-recommendations",
      active: activeItem === "jobs",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Resume Builder",
      href: "#resume-builder",
      active: activeItem === "resume",
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: "Skill Gap Analysis",
      href: "#skill-gap",
      active: activeItem === "skills",
    },
    {
      icon: <Mic className="h-5 w-5" />,
      label: "Mock Interviews",
      href: "#mock-interviews",
      active: activeItem === "interviews",
    },
  ];

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-gray-200 transition-all duration-300 mt-2 pt-10",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-7 border-b border-gray-200">
        <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
       
          
        
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto">
        {sidebarItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-md mx-2 transition-all",
              item.active && "bg-primary text-primary-foreground hover:bg-primary/90",
              !collapsed ? "justify-start" : "justify-center",
              `animate-fade-in [animation-delay:${index * 100 + 100}ms]`
            )}
            onClick={() => handleItemClick(item.label.toLowerCase().split(" ")[0])}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </a>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <a
          href="/profile"
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-all",
            !collapsed ? "justify-start" : "justify-center"
          )}
        >
          <User className="h-5 w-5" />
          {!collapsed && <span>Profile</span>}
        </a>
        <a
          href="/settings"
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-all",
            !collapsed ? "justify-start" : "justify-center"
          )}
        >
          <Cog className="h-5 w-5" />
          {!collapsed && <span>Settings</span>}
        </a>
      </div>
    </div>
  );
}
