import './style.css';
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

  const disposers: Array<() => void> = [() => abort.abort()];

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

  // Lazy-load the heavy three.js chunk so first paint is fast.
  let stopped = false;
  let disposeDarkstar: null | (() => void) = null;
  let loading = false;

  const loadDarkstar = async () => {
    if (stopped || disposeDarkstar || loading) return;
    loading = true;
    try {
      const { initDarkstar } = await import('./darkstar/initDarkstar');
      disposeDarkstar = await initDarkstar(darkstarContainer, {
        baseUrl: base,
        isLowPower: isMobile(),
      });
      disposers.push(() => {
        disposeDarkstar?.();
        disposeDarkstar = null;
      });
    } catch (e) {
      reportFatalError(e);
    } finally {
      loading = false;
    }
  };

  // Start loading on idle (with a timeout), and also if the section is near view.
  const startIdle = () => {
    const ric = (window as unknown as { requestIdleCallback?: Function }).requestIdleCallback;
    if (typeof ric === 'function') ric(() => loadDarkstar(), { timeout: 1500 });
    else window.setTimeout(() => loadDarkstar(), 0);
  };
  startIdle();

  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) loadDarkstar();
      },
      { root: null, threshold: 0.01, rootMargin: '400px 0px 400px 0px' }
    );
    io.observe(darkstarContainer);
    disposers.push(() => io.disconnect());
  } else {
    loadDarkstar();
  }

  const dispose = () => {
    if (stopped) return;
    stopped = true;

    // Run custom disposers first (e.g. remove listeners, cancel RAFs)
    for (const d of disposers.splice(0).reverse()) {
      try {
        d();
      } catch (e) {
        console.warn('Dispose failed:', e);
      }
    }
  };

  window.__disposeWebsite3d = dispose;
}

main().catch(reportFatalError);
