// AnimatedTitle.tsx
import React from "react";
import styled from "styled-components";

// Interface para as props customizadas (polimórficas)
interface AnimatedTitleProps {
  text: string | undefined;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "small" | "medium" | "large";
  align?: "left" | "center" | "right";
  className?: string;
  style?: React.CSSProperties;
}

// Interface apenas para os props usados no styled-component
interface StyledTitleProps {
  size?: "small" | "medium" | "large";
  align?: "left" | "center" | "right";
}

const AnimatedTitleStyled = styled.div<StyledTitleProps>`
  margin: 0;
  font-family: "Arial", sans-serif;
  font-weight: bold;
  font-size: ${(props) => {
    switch (props.size) {
      case "small":
        return "1.2rem";
      case "medium":
        return "2rem";
      case "large":
        return "3rem";
      default:
        return "2rem";
    }
  }};
  text-align: ${(props) => props.align};
  background: linear-gradient(
    45deg,
    #f9f6ec,
    #88a1a8,
    #502940,
    #790614,
    #0d0c0c
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradientAnimation 8s ease-in-out infinite;

  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  level = "h1",
  size = "medium",
  align = "left",
  className = "",
  style = {},
}) => {
  return (
    <AnimatedTitleStyled
      as={level} // Passa o 'as' diretamente aqui (resolve o erro de tipagem)
      size={size}
      align={align}
      className={className}
      style={style}
    >
      {text}
    </AnimatedTitleStyled>
  );
};

export default AnimatedTitle;
