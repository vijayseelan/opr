
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileEdit, Files, Home, Settings } from "lucide-react";

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/create-report", label: "Create Report", icon: FileEdit },
    { href: "/all-reports", label: "All Reports", icon: Files },
    { href: "/template-settings", label: "Template Settings", icon: Settings },
  ];

  return (
    <aside className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Menu
          </h2>
          <div className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  isActive(href) ? "bg-accent" : "transparent"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
