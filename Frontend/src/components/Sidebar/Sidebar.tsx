import {
  Settings,
  User2,
  Database,
  ShoppingCart,
  MonitorPlay,
  GamepadDirectional,
  ListOrdered,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarFooter,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/Hooks/useAuth";
import { useEffect, useState } from "react";
import { getSidebarOptions } from "@/Repositories/sidebar";

type TItem = {
  id: number;
  title: string;
  url: string | undefined;
  icon: any;
  subItem?:
    | {
        id: number;
        title: string;
        url: string;
        disabled?: boolean;
      }[]
    | undefined;
};

const iconMap: Record<string, any> = {
  ShoppingCart,
  Database,
  MonitorPlay,
  GamepadDirectional,
  Settings,
  User2,
  ListOrdered,
};

export function AppSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { setOpenMobile, setOpen } = useSidebar();
  const [sidebarData, setSidebarData] = useState<{
    items: TItem[];
    userOptions: TItem;
  } | null>(null);

  const handleClick = (id: number, URL: string) => {
    if (id === 91) {
      logout();
    }
    navigate(URL);
    setOpen(false);
    setOpenMobile(false);
  };

  useEffect(() => {
    (async () => {
      const res = await getSidebarOptions();
      if (!res) return;
      setSidebarData(res);
    })();
  }, []);

  const UserIcon = iconMap[sidebarData?.userOptions?.icon] ?? User2;

  const handleClickNavigate = (URL: string) => {
    navigate(URL);
    setOpen(false);
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="md:py-20 min-w-[250px]">
            <SidebarMenu>
              {(sidebarData?.items ?? []).map((item, index) => {
                const IconComponent = iconMap[item.icon];
                return (
                  <Collapsible className="group/collapsible" key={index + 1}>
                    <SidebarGroup key={index}>
                      <SidebarGroupLabel asChild>
                        <CollapsibleTrigger className="hover:bg-gray-100 gap-4 group-data-[state=open]/collapsible:bg-gray-200 cursor-pointer border">
                          <IconComponent />
                          {item.title}
                          <span className="ml-auto -rotate-90 transition-transform group-data-[state=open]/collapsible:-rotate-180 text-black">
                            {item.subItem ? <>&spades;</> : null}
                          </span>
                        </CollapsibleTrigger>
                      </SidebarGroupLabel>
                      {item.subItem && item.subItem.length > 0
                        ? item.subItem.map((sub, i) => (
                            <CollapsibleContent
                              className="flex pl-6 py-1"
                              key={i}
                            >
                              <SidebarMenuButton
                                onClick={() => handleClickNavigate(sub.url)}
                                disabled={sub.disabled || false}
                                className="cursor-pointer"
                              >
                                <span className="mx-2 rotate-90">♠</span>
                                {sub.title}
                              </SidebarMenuButton>
                            </CollapsibleContent>
                          ))
                        : null}
                    </SidebarGroup>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <UserIcon />
              {sidebarData?.userOptions?.title}
              <span className="ml-auto transition-transform duration-200 -rotate-90 [button[data-state=open]_&]:rotate-0">
                ♠
              </span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="gap-2 text-center flex flex-col"
          >
            {sidebarData?.userOptions?.subItem?.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="w-[250px] border mb-1 hover:bg-black hover:text-white hover:border-white cursor-pointer border-black rounded-full"
              >
                <button
                  className="cursor-pointer "
                  onClick={() => handleClick(item.id, item.url)}
                  disabled={item.disabled}
                >
                  {item.title}
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
