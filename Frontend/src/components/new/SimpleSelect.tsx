import { useState } from "react";
import { SymbolLoading } from "./CustomLoading/SymbolLoading";

type TOption = {
  value: number;
  text: string;
};

type TParams = {
  options: TOption[];
  label: string;
  placeholder?: string;
  onSelect: (productId: number | null) => void;
  isLoading?: boolean;
};

export const SimpleSelect = ({
  options,
  label,
  placeholder = "Selecione...",
  onSelect,
  isLoading,
}: TParams) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setSelectedValue(v);
    onSelect(v === "" ? null : Number(v));
  };

  return (
    <div className="flex flex-col gap-2 max-w-xs justify-self-center">
      <label htmlFor="categoria" className="text-sm font-medium">
        {label}
      </label>

      <select
        id="categoria"
        value={selectedValue}
        onChange={handleChange}
        className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>

      {isLoading && (
        <p className="text-xs text-zinc-400">
          Carregando produto aguarde: <SymbolLoading />
        </p>
      )}
    </div>
  );
};
