import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHandReadingStore } from "@/store/useHandReadingStore";

/**
 * "Low-friction" entry route for external traffic.
 * - Marks the gate as seen (hasSeenVsl=true)
 * - Redirects straight to the form (includes palm photo upload)
 */
const EntradaFoto = () => {
  const navigate = useNavigate();
  const setHasSeenVsl = useHandReadingStore((s) => s.setHasSeenVsl);

  useEffect(() => {
    setHasSeenVsl(true);
    navigate("/formulario", { replace: true });
  }, [navigate, setHasSeenVsl]);

  return null;
};

export default EntradaFoto;

