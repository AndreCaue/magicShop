import { cn } from "@/lib/utils";

type TAsEspadas = {
  className?: string;
};

export const AsEspadas = ({ className }: TAsEspadas) => {
  return (
    <div className={cn("text-center", className)}>
      <svg
        width="100"
        height="140"
        viewBox="0 0 100 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="2"
          width="96"
          height="150"
          rx="10"
          fill="white"
          stroke="black"
          stroke-width="2"
        />

        <text
          x="50"
          y="90"
          font-size="50"
          text-anchor="middle"
          font-family="Arial"
        >
          ♠
        </text>

        <text x="10" y="20" font-size="20" font-family="Arial" fill="black">
          A
        </text>

        <text
          x="90"
          y="130"
          font-size="20"
          font-family="Arial"
          fill="black"
          transform="rotate(180, 90, 130)"
        >
          A
        </text>

        <text x="12" y="35" font-size="20" font-family="Arial">
          ♠
        </text>
        <text
          x="91"
          y="120"
          font-size="20"
          font-family="Arial"
          transform="rotate(180, 90, 115)"
        >
          ♠
        </text>
      </svg>
    </div>
  );
};
