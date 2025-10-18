import { Link, useLocation } from "react-router-dom";
import { Home, Upload, AlertCircle, TrendingUp } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/upload", icon: Upload, label: "Upload" },
    { path: "/alerts", icon: AlertCircle, label: "Alerts" },
    { path: "/credit", icon: TrendingUp, label: "Credit" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
