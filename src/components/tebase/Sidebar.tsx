import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu,
  Building,
  FileText,
  Clock,
  Briefcase,
  UserPlus,
  Bell,
  AlertTriangle,
  UserCog,
  UserCircle,
  Shield,
  DollarSign,
  Database,
  ServerCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ collapsed = false, onToggle }: SidebarProps) => {
  const [active, setActive] = useState("dashboard");

  // Mock user data - in a real app, this would come from authentication
  const currentUser = {
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Director",
    isAdmin: true,
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/",
    },
    {
      id: "teachers",
      label: "Teachers",
      icon: <Users size={20} />,
      path: "/teachers",
    },
    {
      id: "schools",
      label: "Schools",
      icon: <Building size={20} />,
      path: "/schools",
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: <Calendar size={20} />,
      path: "/bookings",
    },
    {
      id: "weekly-report",
      label: "Weekly Report",
      icon: <BarChart3 size={20} />,
      path: "/weekly-report",
    },
    {
      id: "payroll",
      label: "Payroll",
      icon: <DollarSign size={20} />,
      path: "/payroll",
    },
    {
      id: "availability",
      label: "Teacher Availability",
      icon: <Clock size={20} />,
      path: "/availability",
    },
    {
      id: "timesheets",
      label: "Timesheets",
      icon: <FileText size={20} />,
      path: "/timesheets",
    },
    {
      id: "vacancies",
      label: "Vacancies",
      icon: <Briefcase size={20} />,
      path: "/vacancies",
    },
    {
      id: "recruitment",
      label: "Recruitment",
      icon: <UserPlus size={20} />,
      path: "/recruitment",
    },
    {
      id: "alarms",
      label: "Alarms",
      icon: <Bell size={20} />,
      path: "/alarms",
    },
    {
      id: "complaints",
      label: "Complaints",
      icon: <AlertTriangle size={20} />,
      path: "/complaints",
    },
    {
      id: "compliance",
      label: "Compliance",
      icon: <Shield size={20} />,
      path: "/compliance",
    },
    {
      id: "team-leaders",
      label: "Team Leaders",
      icon: <UserCog size={20} />,
      path: "/team-leaders",
    },
    {
      id: "management",
      label: "Management",
      icon: <BarChart3 size={20} />,
      path: "/management",
    },
    {
      id: "hr",
      label: "HR",
      icon: <UserCircle size={20} />,
      path: "/hr",
    },
    {
      id: "directors",
      label: "Directors",
      icon: <Building size={20} />,
      path: "/directors",
    },
  ];

  const bottomNavItems = [
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
    },
    {
      id: "help",
      label: "Help & Support",
      icon: <HelpCircle size={20} />,
      path: "/help",
    },
  ];

  // IT Admin section - only visible to admins
  const adminItems = [
    {
      id: "it-admin",
      label: "IT Administration",
      icon: <ServerCog size={20} />,
      path: "/it-admin",
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[250px]",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">TB</span>
            </div>
            <span className="font-semibold text-lg">Tebase</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="ml-auto"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <TooltipProvider
              key={item.id}
              delayDuration={collapsed ? 100 : 1000}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      active === item.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100",
                      collapsed && "justify-center",
                    )}
                    onClick={() => setActive(item.id)}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-200 py-4 px-3">
        <nav className="space-y-1">
          {/* IT Admin section - only visible to admins */}
          {currentUser.isAdmin && (
            <div className="mb-2">
              {collapsed ? null : (
                <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Administration
                </p>
              )}
              {adminItems.map((item) => (
                <TooltipProvider
                  key={item.id}
                  delayDuration={collapsed ? 100 : 1000}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          active === item.id
                            ? "bg-purple-50 text-purple-700"
                            : "text-gray-700 hover:bg-gray-100",
                          collapsed && "justify-center",
                        )}
                        onClick={() => setActive(item.id)}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
              {collapsed ? null : (
                <div className="border-t border-gray-200 my-2"></div>
              )}
            </div>
          )}

          {bottomNavItems.map((item) => (
            <TooltipProvider
              key={item.id}
              delayDuration={collapsed ? 100 : 1000}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      active === item.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100",
                      collapsed && "justify-center",
                    )}
                    onClick={() => setActive(item.id)}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}

          <TooltipProvider delayDuration={collapsed ? 100 : 1000}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full",
                    "text-red-600 hover:bg-red-50",
                    collapsed && "justify-center",
                  )}
                >
                  <span className="flex-shrink-0">
                    <LogOut size={20} />
                  </span>
                  {!collapsed && <span>Logout</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">Logout</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </nav>
      </div>

      <div className="border-t border-gray-200 p-4">
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
              alt="User"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Alex Johnson
              </p>
              <p className="text-xs text-gray-500 truncate">alex@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
