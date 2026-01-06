import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type TProps = {
  trigger: string | React.JSX.Element;
  content: string | React.JSX.Element;
  side?: "top" | "right" | "bottom" | "left";
  triggerClassName?: string;
  contentClassName?: string;
  onPressEnter?: () => void;
  disableFocus?: boolean;
  isChild?: boolean;
};

const Popup = (props: TProps) => {
  const {
    trigger,
    content,
    side = "top",
    triggerClassName,
    contentClassName,
    isChild = false,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  return (
    <Popover open={isOpen}>
      <PopoverTrigger
        onMouseEnter={openPopup}
        onMouseLeave={closePopup}
        className={triggerClassName}
        asChild={isChild}
      >
        {trigger}
      </PopoverTrigger>

      <PopoverContent
        side={side}
        onMouseEnter={openPopup}
        onMouseLeave={closePopup}
        className={contentClassName}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
};

export default Popup;
