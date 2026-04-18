import { useEffect, useRef, useState } from "react";
import AnimateHeight, { type Height } from "react-animate-height";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AutoHeight = ({ children, ...props }: any) => {
  const [height, setHeight] = useState<Height>("auto");
  const contentDiv = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = contentDiv.current as HTMLDivElement;

    const resizeObserver = new ResizeObserver(() => {
      setHeight(element.clientHeight);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <AnimateHeight
      {...props}
      height={height}
      contentClassName="auto-content"
      contentRef={contentDiv}
      disableDisplayNone
    >
      {children}
    </AnimateHeight>
  );
};

export default AutoHeight;
