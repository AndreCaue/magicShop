import { cn } from "@/lib/utils";
import type React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
  height: 30px;
  margin-bottom: 2px;
  margin-top: 2rem;
  border: #364153 solid 1px;
`;

const MovingComponent = styled.div`
  height: 2rem;
  color: white;
  position: absolute;
  left: -100px;
  animation: moveRight 10s linear infinite;

  @keyframes moveRight {
    0% {
      left: -100px;
    }
    100% {
      left: 100%;
    }
  }
`;

type TMovingTitle = {
  children?: React.ReactNode;
  title: string;
  className?: string;
};

const MovingTitle = (params: TMovingTitle) => {
  return (
    <Container>
      <MovingComponent>
        {params?.children ? (
          <div className={cn("text-2xl font-bold", params.className)}>
            {params.children}
          </div>
        ) : (
          <div className={cn("text-2xl font-bold", params.className)}>
            {params.title}
          </div>
        )}
      </MovingComponent>
    </Container>
  );
};

export default MovingTitle;
