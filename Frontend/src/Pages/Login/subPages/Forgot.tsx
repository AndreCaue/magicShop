import useIsMobile from "@/Hooks/isMobile";
import { useAuth } from "@/Hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Forgot = () => {
  const isMobile = useIsMobile();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) return;
    navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <>
      {isMobile ? (
        <div className="text-white flex flex-col gap-20">
          <h1 className="text-4xl">EM MANUTENÇÃO</h1>
          <h1 className="text-4xsl text-center">Aguarde</h1>

          <b className="text-white">
            Em caso de necessidade: mcd.magica.cartas@gmail.columns-md <br /> :
            Tratar com André
          </b>
        </div>
      ) : (
        <div> desktop</div>
      )}
    </>
  );
};
