import { motion } from "framer-motion";

const LABELS = ["Again", "Hard", "Good", "Easy"] as const;
const RATINGS = [1, 2, 3, 4] as const;
const COLORS = ["bg-ba-red", "bg-orange-500", "bg-ba-green", "bg-ba-accent"] as const;

interface RatingButtonsProps {
  onRate: (rating: number) => void;
  disabled?: boolean;
}

export function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {RATINGS.map((r, i) => (
        <motion.button
          key={r}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={() => onRate(r)}
          disabled={disabled}
          className={`rounded-xl px-5 py-2.5 font-medium text-white transition-opacity ${
            COLORS[i]
          } ${disabled ? "cursor-not-allowed opacity-50" : "hover:opacity-90"}`}
        >
          {LABELS[i]}
        </motion.button>
      ))}
    </div>
  );
}
