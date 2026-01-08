import useIsMobile from "@/Hooks/isMobile";
import AnimatedTitle from "@/components/new/AnimatedTitle";
import { Logon } from "./subPages/LoginMobile";
import { useAuth } from "@/Hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginDesk } from "./subPages/LoginDesktop";
import MatrixDeckRainUltimate from "../Animations/MatrixDeckRain";

export const Login = () => {
  const isMobile = useIsMobile();

  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    if (!isLoggedIn) return;
    navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <div className="grid grid-cols-3 w-full h-screen absolute">
      <div className="lg:col-span-2">
        {isMobile ? (
          <div className="relative top-1/2 -rotate-90">
            <AnimatedTitle
              text="L O G I N"
              level="h1"
              className="text-nowrap text-8xl w-[300px]"
              size="large"
              align="center"
            />
          </div>
        ) : (
          <>
            <div>
              <MatrixDeckRainUltimate />
            </div>
          </>
        )}
      </div>
      <div className="border-l p-2 border-white col-span-2 lg:col-span-1">
        {isMobile ? (
          <div className="flex w-full h-full justify-center">
            <Logon />
          </div>
        ) : (
          <>
            <div>
              <LoginDesk />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
