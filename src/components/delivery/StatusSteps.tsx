import { motion } from "framer-motion";
import { Check, Clock, Camera, CreditCard } from "lucide-react";

interface Step {
  label: string;
  status: "completed" | "pending" | "processing";
  icon: "payment" | "photo" | "reading";
}

interface StatusStepsProps {
  steps?: Step[];
}

const defaultSteps: Step[] = [
  { label: "Payment confirmed", status: "completed", icon: "payment" },
  { label: "Photo received", status: "completed", icon: "photo" },
  { label: "Reading in progress", status: "processing", icon: "reading" },
];

const iconMap = {
  payment: CreditCard,
  photo: Camera,
  reading: Clock,
};

const StatusSteps = ({ steps = defaultSteps }: StatusStepsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-strong rounded-2xl p-6 md:p-8"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6 font-serif">
        Your order status
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = iconMap[step.icon];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="flex items-center gap-4"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === "completed"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : step.status === "processing"
                    ? "bg-mystic-gold/20 text-mystic-gold animate-pulse"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.status === "completed" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-base ${
                  step.status === "completed"
                    ? "text-foreground"
                    : step.status === "processing"
                    ? "text-mystic-gold"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {step.status === "processing" && (
                <span className="text-xs text-mystic-gold/70 ml-auto">
                  In progress
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StatusSteps;
