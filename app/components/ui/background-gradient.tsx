import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const gradientClass =
    "bg-[radial-gradient(120%_120%_at_20%_20%,rgba(125,196,255,0.35),transparent),radial-gradient(100%_90%_at_85%_15%,rgba(255,229,180,0.28),transparent),radial-gradient(140%_140%_at_88%_82%,rgba(156,107,255,0.25),transparent),radial-gradient(110%_110%_at_12%_88%,rgba(86,226,197,0.24),transparent),radial-gradient(120%_120%_at_50%_50%,rgba(255,255,255,0.06),rgba(20,17,35,0.2))]";
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    },
  };
  return (
    <div
      className={cn(
        "relative group overflow-hidden rounded-[24px] p-[2px] shadow-[0_25px_60px_-35px_rgba(0,0,0,0.55)]",
        containerClassName
      )}
    >
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 12,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-2xl z-[1] opacity-60 group-hover:opacity-100 blur-2xl transition duration-700 will-change-transform",
          gradientClass
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 12,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-[18px] z-[1] will-change-transform backdrop-blur-[2px] ring-1 ring-white/15",
          gradientClass
        )}
      />
      <div className="absolute inset-0 z-[2] rounded-[18px] bg-black/25 mix-blend-soft-light" />
      <div className="absolute inset-1 z-[3] rounded-[16px] border border-white/8 bg-white/5 backdrop-blur-md shadow-inner" />

      <div className={cn("relative z-10 rounded-[14px]", className)}>
        {children}
      </div>
    </div>
  );
};
