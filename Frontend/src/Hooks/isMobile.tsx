import { useState, useEffect } from "react";

/**
 * Hook para detectar se a tela está no modo mobile ou desktop.
 * @param {number} breakpoint - Largura máxima em px para considerar mobile (padrão: 767px).
 * @returns {boolean} - True se mobile, false se desktop.
 */
function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    // Inicializa o estado
    handleChange();

    // Adiciona listener eficiente para mudanças na media query
    mediaQuery.addEventListener("change", handleChange);

    // Limpa o listener ao desmontar o componente
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakpoint]); // Re-executa se o breakpoint mudar

  return isMobile;
}

export default useIsMobile;
