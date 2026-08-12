"use client";

import {
  motion,
  type Target,
  type TargetAndTransition,
  type Transition,
  type VariantLabels,
} from "motion/react";

export type TextRollProps = {
  children: string;
  duration?: number;
  delay?: number;
  trigger?: boolean;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  className?: string;
  transition?: Transition;
  variants?: {
    enter: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
    exit: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
  };
  onAnimationComplete?: () => void;
};

const defaultVariants = {
  enter: {
    animate: { rotateX: 90, opacity: 0 },
    initial: { rotateX: 0, opacity: 1 },
  },
  exit: {
    animate: { rotateX: 0, opacity: 1 },
    initial: { rotateX: 90, opacity: 0 },
  },
} as const;

export function TextRoll({
  children,
  duration = 0.5,
  delay = 0,
  trigger = true,
  getEnterDelay = (i) => i * 0.1,
  getExitDelay = (i) => i * 0.1 + 0.2,
  className,
  transition = { ease: "easeIn" },
  variants,
  onAnimationComplete,
}: TextRollProps) {
  const words = children.split(" ");
  let totalLetterCount = 0;

  return (
    <span className={className}>
      {words.map((word, wordIndex) => {
        const isLastWord = wordIndex === words.length - 1;
        const letters = word.split("");
        
        return (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {letters.map((letter, letterIndex) => {
              const i = totalLetterCount++;
              const isLastLetter = isLastWord && letterIndex === letters.length - 1;
              
              return (
                <span
                  aria-hidden="true"
                  className="perspective-[10000px] transform-3d relative inline-block w-auto"
                  key={i}
                >
                  <motion.span
                    initial={variants?.enter?.initial ?? defaultVariants.enter.initial}
                    animate={trigger ? (variants?.enter?.animate ?? defaultVariants.enter.animate) : (variants?.enter?.initial ?? defaultVariants.enter.initial)}
                    className="backface-hidden absolute inline-block origin-[50%_25%]"
                    transition={{ ...transition, delay: delay + getEnterDelay(i), duration }}
                  >
                    {letter}
                  </motion.span>
                  <motion.span
                    initial={variants?.exit?.initial ?? defaultVariants.exit.initial}
                    animate={trigger ? (variants?.exit?.animate ?? defaultVariants.exit.animate) : (variants?.exit?.initial ?? defaultVariants.exit.initial)}
                    className="backface-hidden absolute inline-block origin-[50%_100%]"
                    onAnimationComplete={
                      isLastLetter ? onAnimationComplete : undefined
                    }
                    transition={{ ...transition, delay: delay + getExitDelay(i), duration }}
                  >
                    {letter}
                  </motion.span>
                  <span className="invisible">{letter}</span>
                </span>
              );
            })}
            {/* Add space after word unless it's the last word */}
            {!isLastWord && (
              <span className="inline-block w-[0.25em]">&nbsp;</span>
            )}
          </span>
        );
      })}
      <span className="sr-only">{children}</span>
    </span>
  );
}

export default TextRoll;
