
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
    <Sidebar 
      variant="sidebar" 
      collapsible="offcanvas" 
      className="bg-background border-r border-border md:bg-sidebar"
    >
      <SidebarRail />
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={location.pathname === item.url ? "bg-accent" : ""}
                    asChild
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
          className="w-full text-red-500 hover:text-red-600"
          tooltip="Sign Out"
        >
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </div>
        </SidebarMenuButton>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
