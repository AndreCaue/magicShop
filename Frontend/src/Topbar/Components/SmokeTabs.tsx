import { SmokeLink } from "@/components/new/SmokeLink";
import { SmokeButton } from "@/components/new/SmokeTab";
import { cn } from "@/lib/utils";

type TSmokeTabs = {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  isMobile?: boolean;
};

const subTab = [
  { label: "Baralhos", link: "baralhos" },
  { label: "Acessórios", link: "acessorios" },
  { label: "Trukes", link: "trukes" },
  { label: "Marcas", link: "marcas" },
];

const subTabConteudo = [
  { label: "Vídeos", link: "videos" },
  { label: "E-Books", link: "books" },
];
const subTabJogos = [{ label: "Jogos", link: "jogos" }];

// function handleRedirect() {}

// const tabContent: Record<string, React.ReactNode> = {
//   loja: (
//     <div className="flex justify-between px-10 underline w-full">
//       {subTab.map((tab) => (
//         <SmokeLink
//           textLabel={tab.label}
//           background="light"
//           goTo={`loja/${tab.link}`}
//           key={tab.label}
//         />
//       ))}
//     </div>
//   ),
//   conteudo: (
//     <div className="flex justify-between px-10 underline w-full">
//       {subTabConteudo.map((tab) => (
//         <SmokeLink
//           textLabel={tab.label}
//           background="light"
//           goTo={`conteudo/${tab.link}`}
//           key={tab.label}
//         />
//       ))}
//     </div>
//   ),
//   jogos: (
//     <div className="flex justify-between px-10 underline w-full">
//       {subTabJogos.map((tab) => (
//         <SmokeLink
//           textLabel={tab.label}
//           background="light"
//           goTo={`/${tab.link}`}
//         />
//       ))}
//     </div>
//   ),
// };

export const SmokeTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  isMobile = false,
}: TSmokeTabs) => {
  function onClickCloseSubtab() {
    onTabChange("");
  }

  const tabContent: Record<string, React.ReactNode> = {
    loja: (
      <div className="flex justify-between px-10 underline w-full">
        {subTab.map((tab) => (
          <SmokeLink
            textLabel={tab.label}
            background="light"
            goTo={`loja/${tab.link}`}
            onClick={onClickCloseSubtab}
            key={tab.label}
          />
        ))}
      </div>
    ),
    conteudo: (
      <div className="flex justify-between px-10 underline w-full">
        {subTabConteudo.map((tab) => (
          <SmokeLink
            textLabel={tab.label}
            background="light"
            onClick={onClickCloseSubtab}
            goTo={`conteudo/${tab.link}`}
            key={tab.label}
          />
        ))}
      </div>
    ),
    jogos: (
      <div className="flex justify-between px-10 underline w-full">
        {subTabJogos.map((tab) => (
          <SmokeLink
            textLabel={tab.label}
            background="light"
            onClick={onClickCloseSubtab}
            goTo={`/${tab.link}`}
          />
        ))}
      </div>
    ),
  };

  return (
    <>
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
      <nav className="hidden lg:flex bg-slate-200/40s">
        {tabContent[activeTab]}
      </nav>
    </>
  );
};
