import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { Topbar } from "./Topbar/Topbar";

export const Layout = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main>
        <Topbar />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};
