import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ErrorAnimation from "src/assets/Error.json";
import WarningAnimation from "src/assets/Warning.json";
import Lottie from "lottie-react";
import { RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";

type TProps = {
  hasData: boolean;
  isLoading: boolean;
  error: boolean;
  showContent: boolean;
  refreshRequest: () => void;
  showStatusText: boolean;
  setShowStatusText: (show: boolean) => void;
};

const StatusPlaceholder = (props: TProps) => {
  const {
    error,
    isLoading,
    hasData,
    showContent,
    refreshRequest,
    showStatusText,
    setShowStatusText,
  } = props;

  const errorRef = useRef<any>(null);
  const warningRef = useRef<any>(null);

  useEffect(() => {
    if (errorRef?.current && error) {
      errorRef.current.goToAndPlay(0, true);
      const timeout = setTimeout(() => setShowStatusText(true), 500);
      return () => clearTimeout(timeout);
    }

    if (warningRef?.current && !error && !isLoading && !hasData) {
      warningRef.current.goToAndPlay(0, true);
      const timeout = setTimeout(() => setShowStatusText(true), 500);
      return () => clearTimeout(timeout);
    }

    setShowStatusText(false);
  }, [error, isLoading, hasData]);

  return (
    <div className="relative flex min-h-[200px] flex-1 items-center justify-center rounded-xl p-4 shadow-[0_0_24px_0_#3217560F]">
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-4 transition-opacity duration-500",
          isLoading && showContent
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        {" "}
        <div className="h-20 w-20 animate-spin rounded-full border-8 border-gray-300 border-t-primary" />
        <span className="flex items-end gap-1 text-xl font-bold text-gray-600">
          Carregando
          <div className="mb-1.5 h-1 w-1 animate-pulse rounded-full bg-gray-600 [animation-delay:-0.3s]" />
          <div className="mb-1.5 h-1 w-1 animate-pulse rounded-full bg-gray-600 [animation-delay:-0.15s]" />
          <div className="mb-1.5 h-1 w-1 animate-pulse rounded-full bg-gray-600" />
        </span>
      </div>

      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-4 transition-opacity duration-500",
          error && showContent
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        {" "}
        <Lottie
          lottieRef={errorRef}
          animationData={ErrorAnimation}
          loop={false}
          className="w-36"
        />
        <p
          className={cn(
            "text-xl font-medium opacity-0 transition-opacity duration-500 ease-in",
            showStatusText && "opacity-100",
          )}
        >
          Ocorreu um erro durante a busca
        </p>
        <Button
          variant="destructive"
          size="sm"
          className={cn(
            "bg-red-500 opacity-0 transition-opacity delay-500 duration-500 ease-in",
            showStatusText && "opacity-100",
          )}
          onClick={refreshRequest}
        >
          <RefreshCw className="mr-2" size={16} /> Tentar novamente
        </Button>
      </div>

      <div
        className={cn(
          "inset-0 flex flex-col items-center justify-center gap-4 transition-opacity duration-500",
          !error && !isLoading && showContent && !hasData
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <Lottie
          lottieRef={warningRef}
          animationData={WarningAnimation}
          loop={false}
          className="w-36"
        />

        <p
          className={cn(
            "text-center text-2xl font-bold opacity-0 transition-opacity duration-500 ease-in",
            showStatusText && "opacity-100",
          )}
        >
          Nenhum resultado encontrado
        </p>

        <p
          className={cn(
            "text-center opacity-0 transition-opacity delay-500 duration-500 ease-in",
            showStatusText && "opacity-100",
          )}
        >
          Os filtros aplicados não retornaram dados. Altere os filtros e tente
          novamente
        </p>
      </div>
    </div>
  );
};

export default StatusPlaceholder;
