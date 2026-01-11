import useIsMobile from "@/Hooks/isMobile";

import { useAuth } from "@/Hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginMobile } from "./LoginMobile";
import { LoginDesktop } from "./LoginDesktop";
import InverseMatrixDeck from "@/Pages/Animations/ReverseMatrixDeck";

export const Login = () => {
  const isMobile = useIsMobile();

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) return;
    navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <>
      {isMobile ? (
        <InverseMatrixDeck>
          <LoginMobile />
        </InverseMatrixDeck>
      ) : (
        <InverseMatrixDeck>
          <LoginDesktop />
        </InverseMatrixDeck>
      )}
    </>
  );
};
