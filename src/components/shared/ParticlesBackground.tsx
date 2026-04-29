import { useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const isMobile = () =>
  typeof window !== 'undefined' &&
  (/Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768);


// ── Three.js galaxy — config por dispositivo ──────────────────────────────────

function getConfig() {
  const mobile = isMobile();
  return {
    count:    mobile ? 8_000  : 130_000,
    radius:   mobile ? 6.5    : 10,
    branches: 4,
    spin:     1.1,
    rand:     0.6,
    randPow:  3,
    dpr:      mobile ? 1      : Math.min(window.devicePixelRatio, 2),
    fps:      mobile ? 30     : 60,
  };
}

const INNER = new THREE.Color('#f0abfc');
const OUTER = new THREE.Color('#9333ea');
const FUCH  = new THREE.Color('#f472b6');
const GOLD  = new THREE.Color('#fbbf24');

function makeStarTexture(): THREE.Texture {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  const half = S / 2;
  const halo = ctx.createRadialGradient(half, half, 0, half, half, half);
  halo.addColorStop(0,    'rgba(255,255,255,0.18)');
  halo.addColorStop(0.35, 'rgba(255,255,255,0.06)');
  halo.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, S, S);
  const core = ctx.createRadialGradient(half, half, 0, half, half, half * 0.28);
  core.addColorStop(0,    'rgba(255,255,255,1)');
  core.addColorStop(0.4,  'rgba(255,255,255,0.85)');
  core.addColorStop(0.75, 'rgba(255,255,255,0.25)');
  core.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

const VERT = /* glsl */`
  attribute float aSize;
  varying   vec3  vColor;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (180.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */`
  uniform sampler2D uTex;
  varying vec3      vColor;
  void main() {
    vec4 t = texture2D(uTex, gl_PointCoord);
    if (t.a < 0.01) discard;
    gl_FragColor = vec4(vColor * t.rgb, t.a);
  }
`;

const Galaxy = memo(() => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const mount = mountRef.current!;
    const cfg = getConfig();
    let W = window.innerWidth;
    let H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(cfg.dpr);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02010a, 0.05);

    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 100);
    camera.position.set(0, 3, 5.5);
    camera.lookAt(0, 0, 0);

    const N = cfg.count;
    const positions = new Float32Array(N * 3);
    const colors    = new Float32Array(N * 3);
    const sizes     = new Float32Array(N);
    const mix = new THREE.Color();

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      const r = Math.random() * cfg.radius;
      const branch = (i % cfg.branches) / cfg.branches * Math.PI * 2;
      const spin = r * cfg.spin;
      const pow = cfg.randPow;
      const rand = cfg.rand;
      const rX = Math.pow(Math.random(), pow) * (Math.random() < 0.5 ? 1 : -1) * rand * r;
      const rY = Math.pow(Math.random(), pow) * (Math.random() < 0.5 ? 1 : -1) * rand * r;
      const rZ = Math.pow(Math.random(), pow) * (Math.random() < 0.5 ? 1 : -1) * rand * r;
      positions[i3]     = Math.cos(branch + spin) * r + rX;
      positions[i3 + 1] = rY * 0.55;
      positions[i3 + 2] = Math.sin(branch + spin) * r + rZ;
      mix.lerpColors(INNER, OUTER, r / cfg.radius);
      if (r > cfg.radius * 0.5 && Math.random() > 0.5) mix.lerp(FUCH, 0.55);
      if (Math.random() > 0.97) mix.lerp(GOLD, 0.8);
      colors[i3]     = mix.r;
      colors[i3 + 1] = mix.g;
      colors[i3 + 2] = mix.b;
      const baseSize = 0.06 + (1 - r / cfg.radius) * 0.06;
      const spike = Math.random() > 0.99 ? 2.2 + Math.random() * 1.2 : 1;
      sizes[i] = baseSize * spike;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

    const tex = makeStarTexture();
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      uniforms: { uTex: { value: tex } },
      vertexColors: true, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.82,
    });

    const galaxy = new THREE.Points(geo, mat);
    scene.add(galaxy);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.tx = (e.clientX / W - 0.5) * 0.6;
      mouse.ty = (e.clientY / H - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    let scrollProgress = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener('resize', onResize, { passive: true });

    let frameId: number;
    const clock = new THREE.Clock();
    const interval = 1000 / cfg.fps;
    let lastTime = 0;

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      if (now - lastTime < interval) return;
      lastTime = now;
      const t = clock.getElapsedTime();
      galaxy.rotation.y = t * 0.07;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      galaxy.rotation.x = mouse.y * 0.4;
      galaxy.rotation.z = mouse.x * 0.15;
      const s = scrollProgress;
      camera.position.x = Math.sin(t * 0.07) * (0.8 - s * 0.6);
      camera.position.y = 3.0 - s * 2.5 + Math.sin(t * 0.05) * 0.4;
      camera.position.z = 5.5 - s * 4.7 + Math.cos(t * 0.07) * 0.4;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      geo.dispose(); mat.dispose(); tex.dispose(); renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden="true" />;
});
Galaxy.displayName = 'Galaxy';

export const ParticlesBackground = memo(() => <Galaxy />);
ParticlesBackground.displayName = 'ParticlesBackground';

// ── FloatingOrbs — glow 2D complementar ──────────────────────────────────────
export const FloatingOrbs = memo(() => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const mobile = isMobile();
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: mobile ? 400 : 900,
          height: mobile ? 200 : 450,
          top: '48%', left: '50%', translateX: '-50%', translateY: '-50%',
          background: 'radial-gradient(ellipse, hsl(280 60% 40% / 0.10) 0%, transparent 70%)',
          filter: mobile ? 'blur(40px)' : 'blur(80px)',
        }}
        animate={mobile
          ? { opacity: [0.3, 0.6, 0.3] }
          : { scaleX: [1, 1.3, 1], scaleY: [1, 0.7, 1], opacity: [0.45, 0.8, 0.45] }
        }
        transition={{ duration: mobile ? 8 : 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
});
FloatingOrbs.displayName = 'FloatingOrbs';
