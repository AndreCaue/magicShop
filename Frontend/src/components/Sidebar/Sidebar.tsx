import {
  Settings,
  User2,
  Database,
  ShoppingCart,
  MonitorPlay,
  GamepadDirectional,
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

export function AppSidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { setOpenMobile } = useSidebar();

  const handleClickLogout = (URL: string) => {
    logout();
    navigate(URL);
  };

  const items: TItem[] = [
    {
      id: 1,
      title: "Loja",
      url: "/",
      icon: ShoppingCart,
      subItem: [
        {
          id: 10,
          title: "Baralhos",
          url: "/loja/baralhos",
        },
        {
          id: 11,
          title: "Acessórios",
          url: "/loja/acessorios",
        },
        {
          id: 12,
          title: "Trukes",
          url: "/loja/trukes",
        },
        {
          id: 13,
          title: "Marcas",
          url: "/loja/marcas",
        },
      ],
    },
    {
      id: 2,
      title: "Conteúdo",
      url: "/conteudo",
      icon: MonitorPlay,
      subItem: [
        { id: 20, title: "Vídeos", url: "/conteudo/videos" },
        { id: 21, title: "E-Books", url: "/conteudo/books" },
      ],
    },
    {
      id: 3,
      title: "Jogos",
      url: "/jogos",
      icon: GamepadDirectional,
      subItem: [{ id: 30, title: "Jogos", url: "/jogos" }],
    },

    {
      id: 5,
      title: "Settings",
      url: "#",
      icon: Settings,
      subItem: [
        { id: 50, title: "Em desenvolvimento", url: "/", disabled: true },
      ],
    },
  ];

  const masterItems: TItem[] = [
    {
      id: 99,
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
        id: 91,
        title: "Logout",
        url: "/login",
      },
    ],
  };

  const handleClickNavigate = (URL: string) => {
    navigate(URL);
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="md:py-20 min-w-[250px]">
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Footer */}
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
