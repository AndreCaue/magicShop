import { cn } from "@/lib/utils";

export const LogoTitle = ({ isMobile }: { isMobile?: boolean }) => {
  if (isMobile)
    return (
      <div
        style={{
          background:
            "linear-gradient(45deg, #f9f6ec, #88a1a8, #502940, #790614, #0d0c0c)",
        }}
        className="flex h-20 w-20 place-self-center my-20 rotate-45"
      >
        <span
          style={{
            fontFamily: "'Road Rage', sans-serif",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "100px",
          }}
          className="text-slate-200 absolute -bottom-8 left-[25%] -rotate-45"
        >
          D
        </span>
        <span
          style={{
            fontFamily: "'Road Rage', sans-serif",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "100px",
          }}
          className="text-white absolute left-[40%] -bottom-7 rotate-40 "
        >
          I
        </span>
      </div>
    );
  return (
    <div
      style={{
        background:
          "linear-gradient(45deg, #f9f6ec, #88a1a8, #502940, #790614, #0d0c0c)",
      }}
      className="flex h-20 w-20 place-self-center rotate-45"
    >
      <span
        style={{
          fontFamily: "'Road Rage', sans-serif",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "100px",
        }}
        className={cn(
          "text-slate-200 absolute -bottom-8 left-[25%] -rotate-45",
          "ex564"
        )}
      >
        D
      </span>
      <span
        style={{
          fontFamily: "'Road Rage', sans-serif",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "100px",
        }}
        className={cn(
          "text-white absolute left-[40%] -bottom-7 rotate-40",
          "ex564"
        )}
      >
        I
      </span>
    </div>
  );
};
