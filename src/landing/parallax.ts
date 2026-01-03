type ParallaxAssets = {
  sky: string;
  m1: string;
  m2: string;
  m3: string;
  planets: string;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * This is the “exact” damping concept from the portfolio:
 *   const x = useSpring(scrollYProgress, { damping: 50 })
 *
 * motion/react (Framer Motion) uses a 2nd-order spring:
 *   x'' = -(k/m)(x - target) - (c/m)x'
 *
 * We replicate that here so the scroll smoothing feels like the original.
 */
type SpringConfig = {
  stiffness: number; // k
  damping: number; // c
  mass: number; // m
};

function springStep(
  state: { x: number; v: number },
  target: number,
  dt: number,
  cfg: SpringConfig
) {
  const { stiffness: k, damping: c, mass: m } = cfg;
  // acceleration
  const a = (-k * (state.x - target) - c * state.v) / m;
  // semi-implicit Euler (stable for UI springs)
  state.v += a * dt;
  state.x += state.v * dt;
  return state.x;
}

function mapRange(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  if (inMax === inMin) return outMin;
  const t = (v - inMin) / (inMax - inMin);
  const tt = clamp01(t);
  return outMin + (outMax - outMin) * tt;
}

export function initLandingParallax(root: HTMLElement, assets: ParallaxAssets) {
  const layerEls = Array.from(
    root.querySelectorAll<HTMLElement>('[data-parallax-layer]')
  );

  // Set images (we keep these in JS so GH Pages base paths work)
  for (const el of layerEls) {
    const key = el.dataset.layer as keyof ParallaxAssets | undefined;
    if (!key) continue;
    const src = assets[key];
    if (src) el.style.backgroundImage = `url("${src}")`;
  }

  // Portfolio uses scrollYProgress (0..1) + useSpring(damping: 50).
  // useSpring defaults: stiffness ~ 100, mass ~ 1 (Framer Motion defaults).
  const springCfg: SpringConfig = { stiffness: 100, damping: 50, mass: 1 };
  const spring = { x: 0, v: 0 }; // smoothed progress + velocity

  const target = { progress: 0 };

  const recomputeTargets = () => {
    const rect = root.getBoundingClientRect();
    // progress: 0 when top hits top; 1 when bottom hits top
    target.progress = clamp01((0 - rect.top) / Math.max(1, rect.height));
  };

  const applyTransforms = (x: number) => {
    const vh = Math.max(1, window.innerHeight);
    const vw = Math.max(1, window.innerWidth);

    // Mirror the portfolio mappings (only active for first ~half scroll)
    const m3Y = mapRange(x, 0, 0.5, 0, 0.7 * vh);
    const planetsX = mapRange(x, 0, 0.5, 0, -0.2 * vw);
    const m2Y = mapRange(x, 0, 0.5, 0, 0.3 * vh);
    const m1Y = mapRange(x, 0, 0.5, 0, 0);

    for (const el of layerEls) {
      const key = el.dataset.layer;
      switch (key) {
        case 'm3':
          el.style.transform = `translate3d(0, ${m3Y}px, 0)`;
          break;
        case 'planets':
          el.style.transform = `translate3d(${planetsX}px, 0, 0)`;
          break;
        case 'm2':
          el.style.transform = `translate3d(0, ${m2Y}px, 0)`;
          break;
        case 'm1':
          el.style.transform = `translate3d(0, ${m1Y}px, 0)`;
          break;
        default:
          el.style.transform = 'translate3d(0, 0, 0)';
      }
    }
  };

  let raf = 0;
  let last = performance.now();
  const tick = () => {
    raf = requestAnimationFrame(tick);

    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;

    // Smooth the scroll progress using the same spring approach as motion/react.
    const x = springStep(spring, target.progress, dt, springCfg);
    applyTransforms(x);
  };

  const onScroll = () => {
    recomputeTargets();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  recomputeTargets();
  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}


