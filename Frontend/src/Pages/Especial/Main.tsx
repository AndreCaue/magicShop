import { BaralhoForm } from "./Formularios/BaralhoForm";
import { DeckCardsSvg } from "@/assets/DeckCardsSvg";
import { Tags, RulerDimensionLineIcon } from "lucide-react";
import { useState } from "react";
import { MarcasForm } from "./Formularios/MarcasForm";
import { PresetsForm } from "./Formularios/PresetsForm";

const tabList = [
  { key: "baralhos", label: "Baralhos", icon: <DeckCardsSvg /> },
  {
    key: "acessorios",
    label: "Acessórios",
    icon: <></>,
  },
  { key: "Gimmick", label: "Gimmicks", icon: <></> },
  { key: "Vídeos", label: "Vídeos", icon: <></> },
  { key: "Livros", label: "Livros", icon: <></> },
  { key: "Marcas", label: "Marcas", icon: <Tags className="text-white" /> },
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
    Gimmick: <div>Gimmicks em breve...</div>,
    Vídeos: <div>Vídeos em breve...</div>,
    Livros: <div>Livros em breve...</div>,
    Marcas: <MarcasForm />,
    presets: <PresetsForm />,
  };

  return (
    <div className="text-white flex justify-center items-center h-screen w-screen">
      <div className="grid grid-cols-6 w-full max-w-7xl h-[90vh] rounded-2xl overflow-auto shadow-lg">
        <div className="border-r border-slate-400 bg-gradient-to-r from-slate-900 to-slate-600 flex flex-col  items-center gap-6 p-4">
          {tabList.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 hover:cursor-pointer ${
                tab === key
                  ? "bg-slate-700 text-white scale-105"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              {icon}
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
        <div className="col-span-5 px-10 py-5 bg-gradient-to-r from-slate-500 to-slate-900">
          {tabContent[tab] ?? (
            <div className="text-2xl text-center">
              Bem-vindo à área principal!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
