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

  let raf = 0;
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  };

  const update = () => {
    const rect = root.getBoundingClientRect();
    const vh = Math.max(1, window.innerHeight);
    const vw = Math.max(1, window.innerWidth);

    // progress: 0 when top hits top; 1 when bottom hits top
    const progress = clamp01((0 - rect.top) / Math.max(1, rect.height));

    // Mirror the portfolio mappings (only active for first ~half scroll)
    const m3Y = mapRange(progress, 0, 0.5, 0, 0.7 * vh);
    const planetsX = mapRange(progress, 0, 0.5, 0, -0.2 * vw);
    const m2Y = mapRange(progress, 0, 0.5, 0, 0.3 * vh);
    const m1Y = mapRange(progress, 0, 0.5, 0, 0);

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

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}


