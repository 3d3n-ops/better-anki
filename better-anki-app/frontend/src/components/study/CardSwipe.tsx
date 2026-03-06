import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, PanInfo, animate } from "framer-motion";
import { FlashCard } from "./FlashCard";

const COMMIT_THRESHOLD = 100;
const OVERLAY_THRESHOLD = 60;

type SwipeState = "front" | "back" | "animating_out";

interface CardSwipeProps {
  question: string;
  answer: string;
  css?: string;
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (rating: number, msTaken: number) => Promise<unknown>;
}

export function CardSwipe({
  question,
  answer,
  css,
  isFlipped,
  onFlip,
  onRate,
}: CardSwipeProps) {
  const [state, setState] = useState<SwipeState>("front");
  const dragStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [18, -18]);
  const goodOpacity = useTransform(x, [0, OVERLAY_THRESHOLD, 120], [0, 0, 1]);
  const againOpacity = useTransform(x, [-120, -OVERLAY_THRESHOLD, 0], [1, 0, 0]);

  const handlePointerDown = useCallback(() => {
    if (state === "front") return;
    dragStart.current = { x: x.get(), y: y.get(), t: Date.now() };
  }, [state, x, y]);

  const handlePanStart = useCallback(() => {
    if (state === "back") dragStart.current = { x: x.get(), y: y.get(), t: Date.now() };
  }, [state, x, y]);

  const handlePan = useCallback(
    (_: unknown, info: PanInfo) => {
      if (state !== "back") return;
      const dx = info.offset.x;
      x.set(Math.max(-200, Math.min(200, dx)));
      y.set(dx * 0.15);
    },
    [state, x, y]
  );

  const handlePanEnd = useCallback(
    async (_: unknown, info: PanInfo) => {
      if (state !== "back") return;
      const dx = info.offset.x;
      const start = dragStart.current;
      const msTaken = start ? Date.now() - start.t : 0;

      if (dx > COMMIT_THRESHOLD) {
        setState("animating_out");
        await animate(x, 400, { type: "spring", stiffness: 300, damping: 30 });
        await onRate(3, msTaken);
        x.set(0);
        y.set(0);
        setState("back");
      } else if (dx < -COMMIT_THRESHOLD) {
        setState("animating_out");
        await animate(x, -400, { type: "spring", stiffness: 300, damping: 30 });
        await onRate(1, msTaken);
        x.set(0);
        y.set(0);
        setState("back");
      } else {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
      }
    },
    [state, x, y, onRate]
  );

  const handleFlip = useCallback(() => {
    if (state === "front") {
      onFlip();
      setState("back");
    } else if (state === "back") {
      onRate(3, 0);
    }
  }, [state, onFlip, onRate]);

  return (
    <div
      className="relative flex items-center justify-center"
      onPointerDown={handlePointerDown}
    >
      {/* Stack depth: placeholder cards behind for visual depth */}
      {[1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-2xl border border-[var(--ba-border)] bg-ba-surface opacity-40"
          style={{
            width: "100%",
            maxWidth: "32rem",
            height: 320,
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${1 - i * 0.04}) translateY(${i * 8}px)`,
            zIndex: 2 - i,
          }}
        />
      ))}
      <motion.div
        className="touch-none"
        style={{
          x,
          y,
          rotate,
          zIndex: 3,
        }}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        drag={state === "back" ? "x" : false}
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
      >
        <div
          onClick={state === "back" ? undefined : handleFlip}
          className={state === "front" ? "cursor-pointer" : ""}
        >
          <FlashCard
            question={question}
            answer={answer}
            isFlipped={isFlipped}
            css={css}
          />
        </div>

        {/* Overlays - only visible when dragging in back state */}
        {state === "back" && (
          <>
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-ba-green bg-ba-green/20"
              style={{ opacity: goodOpacity }}
            >
              <span className="text-3xl font-bold text-ba-green">GOT IT ✓</span>
            </motion.div>
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-ba-red bg-ba-red/20"
              style={{ opacity: againOpacity }}
            >
              <span className="text-3xl font-bold text-ba-red">AGAIN ✗</span>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
