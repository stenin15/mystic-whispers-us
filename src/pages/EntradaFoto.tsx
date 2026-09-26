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

  // `/enviar-foto` é uma entrada direta do funil: libera o portão e manda para o
  // passo da foto. Apontava para `/formulario`, a primeira tela do funil de 12
  // passos — que saiu do caminho em 25/08 e hoje só redireciona para `/`. Ou
  // seja: quem entrava por este link, que promete "envie sua foto", caía na
  // landing. Agora vai para onde o nome diz.
  useEffect(() => {
    setHasSeenVsl(true);
    navigate("/foto", { replace: true });
  }, [navigate, setHasSeenVsl]);

  return null;
};

export default EntradaFoto;

