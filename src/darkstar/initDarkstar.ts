import * as THREE from 'three';

import { createCamera } from '../app/Camera';
import { createRenderer } from '../app/Renderer';
import { createLights } from '../app/Lights';
import { loadSuperHornet } from '../models/SuperHornet';
import { disposeObject3D } from '../app/threeDispose';

export type InitDarkstarOptions = {
  baseUrl: string;
  isLowPower: boolean;
};

export async function initDarkstar(container: HTMLElement, opts: InitDarkstarOptions) {
  // Used to automatically remove event listeners with { signal }.
  const abort = new AbortController();

  // --- DarkStar scene ---
  const scene = new THREE.Scene();

  const disposers: Array<() => void> = [() => abort.abort()];

  // Render-on-demand scheduler (used by resize + input + visibility).
  const maxFps = opts.isLowPower ? 30 : 60;
  const minFrameMs = 1000 / maxFps;
  const maxDpr = opts.isLowPower ? 1.5 : 2;

  let raf = 0;
  let running = false;
  let stopped = false;
  let lastFrame = 0;
  let inView = true;

  let hornet: Awaited<ReturnType<typeof loadSuperHornet>> | null = null;

  const schedule = () => {
    if (stopped || document.hidden || !inView) return;
    if (running) return;
    running = true;
    lastFrame = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const { camera, dispose: disposeCamera } = createCamera(container, { onResize: schedule });
  disposers.push(disposeCamera);

  const { renderer, dispose: disposeRenderer } = createRenderer(container, {
    maxDpr,
    antialias: !opts.isLowPower,
    onResize: schedule,
  });
  disposers.push(disposeRenderer);
  container.appendChild(renderer.domElement);

  const lights = createLights();
  lights.forEach((light) => scene.add(light));

  const tick = (now: number) => {
    if (!running) return;
    if (stopped || document.hidden || !inView) {
      running = false;
      return;
    }

    // FPS cap (especially helpful on mobile + integrated GPUs).
    if (now - lastFrame < minFrameMs) {
      raf = requestAnimationFrame(tick);
      return;
    }
    lastFrame = now;

    const animating = hornet?.update() ?? false;
    renderer.render(scene, camera);

    if (animating) raf = requestAnimationFrame(tick);
    else running = false;
  };

  // Only animate while the canvas section is near the viewport.
  let io: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inView = Boolean(entry?.isIntersecting);
        if (inView) schedule();
        else running = false;
      },
      { root: null, threshold: 0.01, rootMargin: '300px 0px 300px 0px' }
    );
    io.observe(container);
    disposers.push(() => io?.disconnect());
  }

  hornet = await loadSuperHornet({
    scene,
    container,
    baseUrl: opts.baseUrl,
    useSmall: opts.isLowPower,
    onInput: schedule,
  });
  if (hornet) {
    disposers.push(hornet.dispose);
    schedule();
  }

  // Avoid burning GPU while the tab is hidden; render a fresh frame on resume.
  document.addEventListener(
    'visibilitychange',
    () => {
      if (!document.hidden && !stopped) schedule();
    },
    { signal: abort.signal }
  );

  return () => {
    if (stopped) return;
    stopped = true;

    cancelAnimationFrame(raf);
    running = false;

    // Run custom disposers first (e.g. remove listeners, cancel RAFs)
    for (const d of disposers.splice(0).reverse()) {
      try {
        d();
      } catch (e) {
        console.warn('Dispose failed:', e);
      }
    }

    // Remove canvas + free GPU resources.
    renderer.domElement.remove();
    disposeObject3D(scene);
  };
}


