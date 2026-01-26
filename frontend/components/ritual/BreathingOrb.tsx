"use client";

import { motion, type AnimationControls, type Variants } from "framer-motion";

export const ORB_REST_DIAMETER = 88;
export const ORB_MAX_DIAMETER = 96;
export const ORB_MIN_DIAMETER = 84;

export type PreparingPhase = "IDLE" | "COLLAPSE" | "BREATHING" | "EXPAND" | "COMPLETE";

const ORB_GRADIENT = "radial-gradient(circle at 50% 45%, #ffffff 0%, #f2f2f2 55%, #e6e6e6 100%)";

const orbVariants: Variants = {
  collapseStart: (custom: { collapseStartScale: number }) => ({
    scale: custom.collapseStartScale,
  }),
  collapse: {
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  inhale: {
    scale: ORB_MAX_DIAMETER / ORB_REST_DIAMETER,
    transition: {
      duration: 1.2,
      ease: "easeInOut",
    },
  },
  exhale: {
    scale: ORB_MIN_DIAMETER / ORB_REST_DIAMETER,
    transition: {
      duration: 1.6,
      ease: "easeInOut",
    },
  },
  expand: (custom: { expandScale: number }) => ({
    scale: custom.expandScale,
    transition: {
      duration: 0.7,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
  still: {
    scale: 1,
  },
};

type BreathingOrbProps = {
  phase: PreparingPhase;
  controls: AnimationControls;
  expandScale: number;
  reduceMotion: boolean;
};

export default function BreathingOrb({ phase, controls, expandScale, reduceMotion }: BreathingOrbProps) {
  return (
    <motion.div
      role="presentation"
      aria-hidden="true"
      className="rounded-full"
      style={{
        width: ORB_REST_DIAMETER,
        height: ORB_REST_DIAMETER,
        background: ORB_GRADIENT,
      }}
      variants={orbVariants}
      initial={reduceMotion ? "still" : "collapseStart"}
      animate={controls}
      custom={{ collapseStartScale: expandScale, expandScale }}
      data-phase={phase}
    />
  );
}
