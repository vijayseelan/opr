
import { LayoutDashboard, FileEdit, Files, Settings, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Report",
    url: "/create-report",
    icon: FileEdit,
  },
  {
    title: "All Reports",
    url: "/all-reports",
    icon: Files,
  },
  {
    title: "Template Settings",
    url: "/template-settings",
    icon: Settings,
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarRail />
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={`${location.pathname === item.url ? "bg-accent font-medium" : ""} transition-colors duration-200`}
                    asChild
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-3 py-2">
                      <item.icon className="h-5 w-5" />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-4 border-t border-sidebar-border">
        <SidebarMenuButton
          onClick={handleSignOut}
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
          tooltip="Sign Out"
        >
          <div className="flex items-center gap-3 py-2">
            <LogOut className="h-5 w-5" />
            <span className="text-base font-medium">Sign Out</span>
          </div>
        </SidebarMenuButton>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
