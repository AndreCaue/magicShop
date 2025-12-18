import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
  Database,
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
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/Services/userService";
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
      }[]
    | undefined;
};

export function AppSidebar() {
  const navigate = useNavigate();
  const { isLoggedIn, handleLogout } = useAuth();
  const { user } = useUser();

  const handleClickLogout = (URL: string) => {
    handleLogout();
    navigate(URL);
  };

  const items: TItem[] = [
    {
      id: 1,
      title: "Home",
      url: "/",
      icon: Home,
      subItem: [
        {
          id: 11,
          title: "Subitem",
          url: "/",
        },
      ],
    },
    {
      id: 2,
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      id: 3,
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      id: 4,
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      id: 5,
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];

  const masterItems: TItem[] = [
    {
      id: 1,
      title: "Cadastros",
      url: "/",
      icon: Database,
      subItem: [
        {
          id: 11,
          title: "Produtos",
          url: "/master",
        },
      ],
    },
  ];

  const userOptions: TItem = {
    id: 9,
    title: "Username",
    url: "/login",
    icon: User2,
    subItem: [
      {
        id: 14,
        title: "Configurações",
        url: "/",
      },
      {
        id: 12,
        title: "Logout", // se não tiver logado será login
        url: "/login",
      },
    ],
  };

  const handleClickNavigate = (URL: string) => {
    navigate(URL);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="py-20 min-w-[250px]">
            <SidebarMenu>
              {(user?.isMaster ? masterItems : items).map((item, index) => (
                <Collapsible className="group/collapsible" key={index + 1}>
                  <SidebarGroup key={index}>
                    <SidebarGroupLabel asChild>
                      <CollapsibleTrigger className="hover:bg-gray-100 gap-4 group-data-[state=open]/collapsible:bg-gray-200 cursor-pointer border">
                        <item.icon />
                        {item.title}
                        <span className="ml-auto -rotate-90 transition-transform group-data-[state=open]/collapsible:-rotate-180 text-black">
                          {item.subItem ? <>&spades;</> : null}
                        </span>
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    {item.subItem && item.subItem.length > 0
                      ? item.subItem.map((sub) => (
                          <CollapsibleContent
                            className="flex pl-6 py-1"
                            key={index}
                          >
                            <SidebarMenuButton
                              onClick={() => handleClickNavigate(sub.url)}
                            >
                              <span className="mx-2 rotate-90">♠</span>
                              {sub.title}
                            </SidebarMenuButton>
                          </CollapsibleContent>
                        ))
                      : null}
                  </SidebarGroup>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <userOptions.icon />
              {userOptions.title}
              <span className="ml-auto transition-transform duration-200 -rotate-90 [button[data-state=open]_&]:rotate-0">
                ♠
              </span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="gap-2 text-center flex flex-col"
          >
            {userOptions.subItem?.map((item) => (
              <DropdownMenuItem className="w-[250px] hover:bg-gray-100">
                <button
                  className="cursor-pointer"
                  onClick={() => handleClickLogout(item.url)}
                >
                  <span>{item.title}</span>
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
