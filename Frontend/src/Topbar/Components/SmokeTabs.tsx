import { SmokeButton } from "@/components/new/SmokeTab";
import { cn } from "@/lib/utils";

type TSmokeTabs = {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  isMobile?: boolean;
};

// parei aqui
// adicionar outro nav que será exibido junto com o active.
export const SmokeTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  isMobile = false,
}: TSmokeTabs) => {
  return (
    <nav className={cn("hidden lg:flex lg:justify-around", className)}>
      {tabs.map((tab) => (
        <SmokeButton
          key={tab.id}
          textLabel={tab.label}
          onClick={() => onTabChange(tab.id)}
          isActive={activeTab === tab.id}
          isMobile={isMobile}
        />
      ))}
    </nav>
  );
};
