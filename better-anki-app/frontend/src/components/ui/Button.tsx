import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
}: ButtonProps) {
  const base =
    "rounded-xl px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-ba-accent text-white hover:opacity-90",
    secondary: "bg-ba-surface2 text-ba-text hover:bg-ba-surface",
    danger: "bg-ba-red/20 text-ba-red hover:bg-ba-red/30",
    ghost: "text-ba-muted hover:text-ba-text",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
