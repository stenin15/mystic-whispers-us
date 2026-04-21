import { useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// ─── CONFIG ───────────────────────────────────────────────
const isMobile = () => /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

function getConfig() {
  const mobile = isMobile();
  return {
    count:    mobile ? 60_000 : 150_000,
    radius:   mobile ? 5      : 7,
    branches: 4,
    spin:     1.3,
    rand:     0.65,
    randPow:  3,
    dpr:      mobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2),
  };
}

const INNER = new THREE.Color('#f8d560');   // gold brilhante
const OUTER = new THREE.Color('#a855f7');   // violet
const FUCH  = new THREE.Color('#e040fb');   // fuchsia

// ── Textura realista de estrela: núcleo nítido + halo suave ──
function makeStarTexture(): THREE.Texture {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  const half = S / 2;

  // 1. Halo externo amplo e suave
  const halo = ctx.createRadialGradient(half, half, 0, half, half, half);
  halo.addColorStop(0,    'rgba(255,255,255,0.18)');
  halo.addColorStop(0.35, 'rgba(255,255,255,0.06)');
  halo.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, S, S);

  // 2. Núcleo brilhante e nítido
  const core = ctx.createRadialGradient(half, half, 0, half, half, half * 0.28);
  core.addColorStop(0,    'rgba(255,255,255,1)');
  core.addColorStop(0.4,  'rgba(255,255,255,0.85)');
  core.addColorStop(0.75, 'rgba(255,255,255,0.25)');
  core.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, S, S);

  return new THREE.CanvasTexture(c);
}

// ── Vertex shader: cada estrela tem tamanho próprio (aSize attribute) ──
const VERT = /* glsl */`
  attribute float aSize;
  varying   vec3  vColor;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // tamanho perspectiva: aSize pixels * fator de distância
    gl_PointSize = aSize * (180.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`;

// ── Fragment shader: aplica textura circular ──
const FRAG = /* glsl */`
  uniform sampler2D uTex;
  varying vec3      vColor;
  void main() {
    vec4 t = texture2D(uTex, gl_PointCoord);
    if (t.a < 0.01) discard;
    gl_FragColor = vec4(vColor * t.rgb, t.a);
  }
`;

export const ParticlesBackground = memo(() => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const mount = mountRef.current!;
    const cfg = getConfig();
    let W = window.innerWidth;
    let H = window.innerHeight;

    // ── Renderer ──────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(cfg.dpr);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    // canvas sempre cobre toda a viewport
    renderer.domElement.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    mount.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog   = new THREE.FogExp2(0x02010a, 0.05);

    // ── Camera ────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 100);
    camera.position.set(0, 3, 5.5);
    camera.lookAt(0, 0, 0);

    // ── Geometria da galáxia ──────────────────────────────
    const N = cfg.count;
    const positions = new Float32Array(N * 3);
    const colors    = new Float32Array(N * 3);
    const sizes     = new Float32Array(N);          // tamanho único por estrela
    const mix       = new THREE.Color();

    for (let i = 0; i < N; i++) {
      const i3     = i * 3;
      const r      = Math.random() * cfg.radius;
      const branch = (i % cfg.branches) / cfg.branches * Math.PI * 2;
      const spin   = r * cfg.spin;

      const pow  = cfg.randPow;
      const rand = cfg.rand;
      const rX = Math.pow(Math.random(), pow) * (Math.random() < 0.5 ? 1 : -1) * rand * r;
      const rY = Math.pow(Math.random(), pow) * (Math.random() < 0.5 ? 1 : -1) * rand * r;
      const rZ = Math.pow(Math.random(), pow) * (Math.random() < 0.5 ? 1 : -1) * rand * r;

      positions[i3]     = Math.cos(branch + spin) * r + rX;
      positions[i3 + 1] = rY * 0.55;
      positions[i3 + 2] = Math.sin(branch + spin) * r + rZ;

      // Cor por raio + variação fuchsia nas bordas
      mix.lerpColors(INNER, OUTER, r / cfg.radius);
      if (r > cfg.radius * 0.72 && Math.random() > 0.55) mix.lerp(FUCH, 0.45);

      colors[i3]     = mix.r;
      colors[i3 + 1] = mix.g;
      colors[i3 + 2] = mix.b;

      // Tamanho variável tiny: centro levemente maior, bordas menores
      // ~1% são estrelas brilhantes visíveis (2× maior)
      const baseSize = 0.06 + (1 - r / cfg.radius) * 0.06;   // 0.06 → 0.12
      const spike    = Math.random() > 0.99 ? 2.2 + Math.random() * 1.2 : 1;
      sizes[i]       = baseSize * spike;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

    // ── ShaderMaterial ────────────────────────────────────
    const tex = makeStarTexture();
    const mat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms:       { uTex: { value: tex } },
      vertexColors:   true,
      transparent:    true,
      blending:       THREE.AdditiveBlending,
      depthWrite:     false,
    });

    const galaxy = new THREE.Points(geo, mat);
    scene.add(galaxy);

    // ── Mouse ─────────────────────────────────────────────
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.tx = (e.clientX / W - 0.5) * 0.6;
      mouse.ty = (e.clientY / H - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    // ── Scroll → mergulho no centro da galáxia ────────────
    let scrollProgress = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Resize — recria tamanho corretamente ───────────────
    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
      renderer.setPixelRatio(getConfig().dpr);
    };
    window.addEventListener('resize', onResize, { passive: true });

    // ── Loop ──────────────────────────────────────────────
    let frameId: number;
    const clock = new THREE.Clock();

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      galaxy.rotation.y = t * 0.04;

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      galaxy.rotation.x = mouse.y * 0.4;
      galaxy.rotation.z = mouse.x * 0.15;

      // Mergulho progressivo: longe (z=5.5) → dentro do núcleo (z=0.8)
      const s  = scrollProgress;
      const tz = 5.5  - s * 4.7;
      const ty = 3.0  - s * 2.5;
      camera.position.x = Math.sin(t * 0.07) * (0.8 - s * 0.6);
      camera.position.y = ty + Math.sin(t * 0.05) * 0.4;
      camera.position.z = tz + Math.cos(t * 0.07) * 0.4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    tick();

    // ── Cleanup ───────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      geo.dispose();
      mat.dispose();
      tex.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // div vazia — o canvas WebGL é appendado aqui via JS
  return <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden="true" />;
});

ParticlesBackground.displayName = 'ParticlesBackground';

// ── FloatingOrbs — glow 2D complementar ───────────────────
export const FloatingOrbs = memo(() => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 900, height: 450,
          top: '48%', left: '50%', translateX: '-50%', translateY: '-50%',
          background: 'radial-gradient(ellipse, hsl(280 60% 40% / 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ scaleX: [1, 1.3, 1], scaleY: [1, 0.7, 1], opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
});

FloatingOrbs.displayName = 'FloatingOrbs';
