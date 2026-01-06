import React, {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

type TQuantitySelector = {
  maxQuantity: number;
  getQuantity: Dispatch<SetStateAction<number>>;
  initialValue: number;
  disabled?: boolean;
};

const QuantitySelector = ({
  maxQuantity = Infinity,
  getQuantity,
  initialValue,
  disabled,
}: TQuantitySelector) => {
  const [quantity, setQuantity] = useState(initialValue);

  const increment = () => {
    setQuantity((prev) => (prev < maxQuantity ? prev + 1 : prev));
  };

  useEffect(() => {
    getQuantity(quantity);
  }, [quantity]);

  const decrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className="flex items-center border border-gray-300 rounded overflow-hidden w-fit">
      <input
        type="number"
        value={quantity}
        readOnly
        className="w-12 text-white text-center border-none py-2 text-lg appearance-textfield [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        className="bg-slate-500 px-3 py-2 cursor-pointer text-lg hover:bg-slate-300 transition-colors"
        onClick={decrement}
        disabled={disabled}
      >
        -
      </button>
      <button
        className="bg-slate-500 px-3 py-2 cursor-pointer text-lg hover:bg-slate-300 transition-colors"
        onClick={increment}
        disabled={disabled}
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
