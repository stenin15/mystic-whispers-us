const Resultado = () => {
  return (
    <div style={{ width: '100%', margin: 0, padding: 0, lineHeight: 0 }}>

      {/* Seção 1 — Hero */}
      <img src="/results/result-hero-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
      <img src="/results/result-hero-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

      {/* Seção 2 — Ofertas */}
      <img src="/results/result-offers-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
      <img src="/results/result-offers-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

      {/* Seção 3 — Preview */}
      <img src="/results/result-preview-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
      <img src="/results/result-preview-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

      {/* Seção 4 — Locked */}
      <img src="/results/result-locked-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
      <img src="/results/result-locked-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

      {/* Seção 5 — Final CTA */}
      <img src="/results/result-final-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
      <img src="/results/result-final-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

    </div>
  );
};

export default Resultado;
