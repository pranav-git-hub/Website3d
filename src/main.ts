import './style.css';
import * as THREE from 'three';
import { createCamera } from './app/Camera';
import { createRenderer } from './app/Renderer';
import { createLights } from './app/Lights';
import { loadSuperHornet } from './models/SuperHornet';
import { disposeObject3D } from './app/threeDispose';
import { isMobile } from './utils/mobileCheck';
import { initLandingParallax } from './landing/parallax';
import { initFlipWords } from './landing/flipWords';

const base = import.meta.env.BASE_URL || '/';

function setSiteBackground() {
  // Ensure CSS background assets resolve under Vite base (important for GH Pages)
  document.documentElement.style.setProperty('--site-bg', `url("${base}assets/intro_bg.PNG")`);
}

function getRequiredEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
}

function reportFatalError(err: unknown) {
  console.error(err);

  const msg = err instanceof Error ? err.message : String(err);
  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'alert');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'grid';
  overlay.style.placeItems = 'center';
  overlay.style.padding = '24px';
  overlay.style.background = 'rgba(0,0,0,0.85)';
  overlay.style.color = 'white';
  overlay.style.fontFamily = 'system-ui, sans-serif';
  overlay.innerHTML = `
    <div style="max-width: 720px">
      <h1 style="margin: 0 0 12px; font-size: 20px">Something went wrong</h1>
      <pre style="white-space: pre-wrap; margin: 0; opacity: 0.9">${msg}</pre>
    </div>
  `;
  document.body.appendChild(overlay);
}

async function main() {
  setSiteBackground();

  const darkstarContainer = getRequiredEl<HTMLDivElement>('darkstar-container');

  // Used to automatically remove event listeners with { signal }.
  const abort = new AbortController();

  // --- Existing DarkStar scene (now properly hosted inside its section) ---
  const scene = new THREE.Scene();

  const disposers: Array<() => void> = [() => abort.abort()];

  const { camera, dispose: disposeCamera } = createCamera(darkstarContainer);
  disposers.push(disposeCamera);

  const { renderer, dispose: disposeRenderer } = createRenderer(darkstarContainer);
  disposers.push(disposeRenderer);
  darkstarContainer.appendChild(renderer.domElement);

  const lights = createLights();
  lights.forEach((light) => scene.add(light));

  const hornet = await loadSuperHornet({
    scene,
    container: darkstarContainer,
    baseUrl: base,
    useSmall: isMobile(),
  });
  if (hornet) disposers.push(hornet.dispose);

  // --- Ported landing: parallax + astronaut ---
  const landingRoot = document.querySelector<HTMLElement>('[data-parallax-root]');

  if (landingRoot) {
    disposers.push(
      initLandingParallax(landingRoot, {
        sky: `${base}assets/sky.jpg`,
        m1: `${base}assets/mountain-1.png`,
        m2: `${base}assets/mountain-2.png`,
        m3: `${base}assets/mountain-3.png`,
        planets: `${base}assets/planets.png`,
      })
    );
  }

  disposers.push(initFlipWords(document));

  let raf = 0;
  let stopped = false;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (stopped || document.hidden) return;
    hornet?.update();
    renderer.render(scene, camera);
  };
  tick();

  // Avoid burning GPU while the tab is hidden; render a fresh frame on resume.
  document.addEventListener(
    'visibilitychange',
    () => {
      if (!document.hidden && !stopped) renderer.render(scene, camera);
    },
    { signal: abort.signal }
  );

  const dispose = () => {
    if (stopped) return;
    stopped = true;

    cancelAnimationFrame(raf);

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

  window.__disposeWebsite3d = dispose;
}

main().catch(reportFatalError);
