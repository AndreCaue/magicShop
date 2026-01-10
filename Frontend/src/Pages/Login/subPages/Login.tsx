import useIsMobile from "@/Hooks/isMobile";
// import AnimatedTitle from "@/components/new/AnimatedTitle";

import { useAuth } from "@/Hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MatrixDeckRain from "@/Pages/Animations/MatrixDeckRain";
import { LoginMobile } from "./LoginMobile";
import { LoginDesktop } from "./LoginDesktop";

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
        <MatrixDeckRain>
          <LoginMobile />
        </MatrixDeckRain>
      ) : (
        <MatrixDeckRain>
          <LoginDesktop />
        </MatrixDeckRain>
      )}
    </>
  );
};
