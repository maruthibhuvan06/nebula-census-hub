import { motion } from "framer-motion";

interface Props {
  steps: string[];
  current: number;
}

export default function ProgressIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <motion.div
            className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-display font-semibold transition-all ${
              i <= current
                ? "gradient-primary text-primary-foreground neon-glow"
                : "bg-muted text-muted-foreground"
            }`}
            animate={i === current ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {i + 1}
          </motion.div>
          <span className={`text-xs hidden sm:block font-medium ${i <= current ? "text-primary" : "text-muted-foreground"}`}>
            {step}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${i < current ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
