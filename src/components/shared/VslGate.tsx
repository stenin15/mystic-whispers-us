import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useHandReadingStore } from "@/store/useHandReadingStore";

type VslGateProps = {
  children: ReactNode;
  redirectTo?: string;
};

export const VslGate = ({ children, redirectTo = "/" }: VslGateProps) => {
  const hasSeenVsl = useHandReadingStore((s) => s.hasSeenVsl);

  if (!hasSeenVsl) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

