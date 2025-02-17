
import { LayoutDashboard, FileEdit, Files, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

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
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };
    getUserEmail();
  }, []);

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
    <Sidebar className="relative flex flex-col h-full">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={location.pathname === item.url ? "bg-accent" : ""}
                    asChild
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

      <div className="mt-auto p-4 border-t border-sidebar-border">
        {userEmail && (
          <div className="text-sm text-muted-foreground mb-2 truncate">
            {userEmail}
          </div>
        )}
        <SidebarMenuButton
          onClick={handleSignOut}
          className="w-full text-red-500 hover:text-red-600"
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
