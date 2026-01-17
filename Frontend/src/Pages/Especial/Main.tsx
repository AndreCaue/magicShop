import { BaralhoForm } from "./Formularios/BaralhoForm";
import { DeckCardsSvg } from "@/assets/DeckCardsSvg";
import {
  Tags,
  RulerDimensionLineIcon,
  BringToFront,
  HatGlasses,
  Film,
  Book,
} from "lucide-react";
import { useState } from "react";
import { CategoriaForm } from "./Formularios/CategoryForm";
import { PresetsForm } from "./Formularios/PresetsForm";

const tabList = [
  { key: "baralhos", label: "Baralhos", icon: <DeckCardsSvg /> },
  {
    key: "acessorios",
    label: "Acessórios",
    icon: <BringToFront className="rotate-135 " />,
  },
  { key: "gimmick", label: "Gimmicks", icon: <HatGlasses /> },
  { key: "midia", label: "Vídeos", icon: <Film /> },
  { key: "books", label: "Livros", icon: <Book /> },
  {
    key: "category",
    label: "Categoria",
    icon: <Tags className="text-white" />,
  },
  {
    key: "presets",
    label: "Dimensões",
    icon: <RulerDimensionLineIcon className="text-white" />,
  },
] as const;

type TTags = (typeof tabList)[number]["key"];

export const MainEspecial = () => {
  const [tab, setTab] = useState<TTags>("baralhos");

  const tabContent: Record<TTags, React.JSX.Element> = {
    baralhos: <BaralhoForm />,
    acessorios: <div>Acessórios em breve...</div>,
    gimmick: <div>Gimmicks em breve...</div>,
    midia: <div>Vídeos em breve...</div>,
    books: <div>Livros em breve...</div>,
    category: <CategoriaForm />,
    presets: <PresetsForm />,
  };

  return (
    <div className="grid grid-cols-9 my-4">
      <div className="border-r col-span-2 md:col-span-1 border-slate-400 bg-gradient-to-r from-slate-900 to-slate-600 flex flex-col rounded-l-2xl  items-center gap-6 p-4">
        {tabList.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-col items-center gap-2 text-white py-2 rounded-xl transition-all duration-300 hover:cursor-pointer ${
              tab === key
                ? "bg-slate-700 text-white lg:scale-105"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            {icon}
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
      <div className="col-span-7 md:col-span-8  text-white  px-10 py-5 bg-gradient-to-r from-slate-500 to-slate-900 rounded-r-2xl">
        {tabContent[tab] ?? (
          <div className="text-2xl text-center">
            Bem-vindo à área principal!
          </div>
        )}
      </div>
    </div>
  );
};
