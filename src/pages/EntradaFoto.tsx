import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHandReadingStore } from "@/store/useHandReadingStore";

/**
 * Rota de entrada "sem fricção" para tráfego externo (ex.: ManyChat).
 * - Seta o gate como visto (hasSeenVsl=true)
 * - Redireciona direto para o formulário que inclui upload da foto da mão
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

