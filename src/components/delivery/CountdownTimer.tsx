import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";

interface CountdownTimerProps {
  minutes?: number;
  onExpire?: () => void;
}

const CountdownTimer = ({ minutes = 15, onExpire }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    // Check if there's a saved end time in sessionStorage
    const savedEndTime = sessionStorage.getItem("countdownEndTime");
    if (savedEndTime) {
      const remaining = Math.max(0, parseInt(savedEndTime) - Date.now());
      return Math.floor(remaining / 1000);
    }
    // Set new end time
    const endTime = Date.now() + minutes * 60 * 1000;
    sessionStorage.setItem("countdownEndTime", endTime.toString());
    return minutes * 60;
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const { minutes: mins, seconds: secs } = formatTime(timeLeft);
  const isUrgent = timeLeft < 300; // Last 5 minutes

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden ${
        isUrgent
          ? "bg-gradient-to-r from-red-900/40 via-red-800/30 to-red-900/40"
          : "bg-gradient-to-r from-mystic-deep/80 via-mystic-purple/30 to-mystic-deep/80"
      } border-b ${isUrgent ? "border-red-500/30" : "border-mystic-gold/20"}`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

      <div className="relative container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles
              className={`w-4 h-4 ${
                isUrgent ? "text-red-400" : "text-mystic-gold"
              } animate-pulse`}
            />
            <span className="text-sm md:text-base text-foreground font-medium">
              Oferta exclusiva expira em:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock
              className={`w-4 h-4 ${
                isUrgent ? "text-red-400" : "text-mystic-gold"
              }`}
            />
            <div className="flex items-center gap-1">
              <motion.span
                key={mins}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-mono text-xl font-bold ${
                  isUrgent
                    ? "bg-red-500/20 text-red-400"
                    : "bg-mystic-gold/20 text-mystic-gold"
                }`}
              >
                {mins}
              </motion.span>
              <span
                className={`text-xl font-bold ${
                  isUrgent ? "text-red-400" : "text-mystic-gold"
                } animate-pulse`}
              >
                :
              </span>
              <motion.span
                key={secs}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-mono text-xl font-bold ${
                  isUrgent
                    ? "bg-red-500/20 text-red-400"
                    : "bg-mystic-gold/20 text-mystic-gold"
                }`}
              >
                {secs}
              </motion.span>
            </div>
          </div>

          <span
            className={`text-xs md:text-sm ${
              isUrgent ? "text-red-300" : "text-mystic-gold/80"
            }`}
          >
            Preço promocional válido apenas nesta sessão
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CountdownTimer;
