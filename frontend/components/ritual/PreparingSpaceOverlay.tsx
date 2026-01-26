"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import BreathingOrb, { ORB_REST_DIAMETER, type PreparingPhase } from "./BreathingOrb";

const COLLAPSE_DURATION_MS = 500;
const EXPAND_DURATION_MS = 700;
const READY_POLL_INTERVAL_MS = 4000;

const overlayVariants = {
  visible: {
    opacity: 1,
    transition: { duration: 0 },
  },
  expand: {
    opacity: 0,
    transition: {
      duration: EXPAND_DURATION_MS / 1000,
      ease: "easeInOut",
    },
  },
};

type PreparingSpaceOverlayProps = {
  isAppReady: boolean;
};

export default function PreparingSpaceOverlay({ isAppReady }: PreparingSpaceOverlayProps) {
  const [phase, setPhase] = useState<PreparingPhase>("IDLE");
  const [expandScale, setExpandScale] = useState(1);
  const readyRef = useRef(isAppReady);
  const controls = useAnimationControls();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    readyRef.current = isAppReady;
  }, [isAppReady]);

  useEffect(() => {
    const computeScale = () => {
      if (typeof window === "undefined") return;
      const { innerWidth, innerHeight } = window;
      const diagonal = Math.sqrt(innerWidth ** 2 + innerHeight ** 2);
      setExpandScale(Math.max(1, diagonal / ORB_REST_DIAMETER));
    };

    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  useEffect(() => {
    if (phase === "IDLE") {
      setPhase("COLLAPSE");
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "COLLAPSE") return;
    let active = true;

    const run = async () => {
      controls.set(reduceMotion ? "still" : "collapseStart");
      if (!reduceMotion) {
        await controls.start("collapse");
      }
      if (!active) return;
      setPhase("BREATHING");
    };

    run();
    return () => {
      active = false;
    };
  }, [controls, phase, reduceMotion, expandScale]);

  useEffect(() => {
    if (phase !== "BREATHING") return;

    if (reduceMotion) {
      if (readyRef.current) {
        setPhase("EXPAND");
      }
      return;
    }

    let active = true;

    const loop = async () => {
      while (active) {
        await controls.start("inhale");
        if (!active) return;
        await controls.start("exhale");
        if (!active) return;
        if (readyRef.current) {
          setPhase("EXPAND");
          return;
        }
      }
    };

    loop();

    return () => {
      active = false;
      controls.stop();
    };
  }, [controls, phase, reduceMotion]);

  useEffect(() => {
    if (phase !== "EXPAND") return;
    let active = true;

    const run = async () => {
      await controls.start("expand");
      if (!active) return;
      setPhase("COMPLETE");
    };

    run();
    return () => {
      active = false;
    };
  }, [controls, phase]);

  useEffect(() => {
    if (phase === "COMPLETE") return undefined;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalCursor = document.body.style.cursor;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.cursor = "none";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.cursor = originalCursor;
    };
  }, [phase]);

  const showText = phase === "BREATHING";

  if (phase === "COMPLETE") {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black pointer-events-auto"
      style={{ cursor: "none" }}
      variants={overlayVariants}
      animate={phase === "EXPAND" ? "expand" : "visible"}
    >
      <div className="flex flex-col items-center">
        <BreathingOrb
          phase={phase}
          controls={controls}
          expandScale={expandScale}
          reduceMotion={Boolean(reduceMotion)}
        />
        {showText ? (
          <p
            className="mt-5 text-[15px] font-normal tracking-[0.08em] text-white/75"
            aria-live="polite"
          >
            Preparing your space
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

export { READY_POLL_INTERVAL_MS };
