import useIsMobile from "@/Hooks/isMobile";
import AnimatedTitle from "@/components/new/AnimTitle";

import { useAuth } from "@/Hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MatrixDeckRain from "@/Pages/Animations/MatrixDeckRain";
import { Logon } from "./Logon";

export const LoginT = () => {
  const isMobile = useIsMobile();

  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    if (!isLoggedIn) return;
    navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <>
      {isMobile ? (
        <div>
          <div className="absolute -left-6 top-1/2 -rotate-90 ">
            <AnimatedTitle
              text="L O G I N"
              level="h1"
              className="text-nowrap text-7xl"
              size="large"
              align="center"
            />
          </div>
          <div className="absolute right-0 top-0 border-l h-full py-20 px-10">
            <Logon />
          </div>
        </div>
      ) : (
        <MatrixDeckRain />
      )}
    </>
  );
};
