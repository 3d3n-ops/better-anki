import { motion } from "framer-motion";

interface FlashCardProps {
  question: string;
  answer: string;
  isFlipped: boolean;
  css?: string;
}

export function FlashCard({ question, answer, isFlipped, css = "" }: FlashCardProps) {
  return (
    <div
      className="relative h-[320px] w-full max-w-lg"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative h-full w-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front face (question) */}
        <div
          className="absolute inset-0 rounded-2xl border border-[var(--ba-border)] bg-ba-surface p-8 shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
          <div
            className="prose prose-invert max-h-full max-w-none overflow-y-auto text-ba-text [&_img]:max-w-full"
            dangerouslySetInnerHTML={{ __html: question }}
          />
        </div>
        {/* Back face (answer) */}
        <div
          className="absolute inset-0 rounded-2xl border border-[var(--ba-border)] bg-ba-surface p-8 shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
          <div
            className="prose prose-invert max-h-full max-w-none overflow-y-auto text-ba-text [&_img]:max-w-full"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        </div>
      </motion.div>
    </div>
  );
}
