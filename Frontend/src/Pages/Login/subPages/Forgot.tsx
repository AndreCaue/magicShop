import useIsMobile from "@/Hooks/isMobile";
import { useAuth } from "@/Hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Forgot = () => {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("teste@email.com"); //fazer email//hook.
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

          <b className="text-white">Em caso de necessidade: {email}</b>
        </div>
      ) : (
        <div> desktop</div>
      )}
    </>
  );
};
