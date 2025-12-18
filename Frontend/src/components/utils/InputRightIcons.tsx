import { Separator } from "@radix-ui/react-dropdown-menu";
import { XIcon } from "lucide-react";

type TIcon = {
  showClearIcon?: boolean;
  isMenuOpen?: boolean;
  handleClear: () => void;
  disabled?: boolean;
  isLoading: boolean;
};

export const InputRightIcons = ({ handleClear, showClearIcon }: TIcon) => {
  return (
    <div
      className="ml-0 mr-2 flex items-center lg:mr-0"
      role="button"
      onClick={() => handleClear()}
    >
      {showClearIcon && (
        <XIcon data-testid="selectCloseIcon" onClick={() => handleClear()} />
      )}

      <Separator className="flex h-full min-h-6" />
    </div>
  );
};
