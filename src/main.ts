import * as THREE from 'three';
import { createCamera } from './app/Camera.ts';
import { createRenderer } from './app/Renderer.ts';
import { createLights } from './app/Lights.ts';
import { loadSuperHornet } from './models/SuperHornet.ts';
import { isMobile } from './utils/mobileCheck.ts';
import { initLandingParallax } from './landing/parallax.ts';
import { initAstronautScene } from './landing/astronautScene.ts';
import { initFlipWords } from './landing/flipWords.ts';

const base = import.meta.env.BASE_URL || '/';

async function main() {
  // Ensure CSS background assets resolve under Vite base (important for GH Pages)
  document.documentElement.style.setProperty('--site-bg', `url("${base}assets/intro_bg.PNG")`);

  const darkstarContainer = document.getElementById('darkstar-container');
  if (!darkstarContainer) throw new Error('Missing #darkstar-container');

  // --- Existing DarkStar scene (now properly hosted inside its section) ---
  const scene = new THREE.Scene();
  const camera = createCamera(darkstarContainer);
  scene.userData.camera = camera; // 🔁 Share camera with other modules

  const renderer = createRenderer(darkstarContainer);
  darkstarContainer.appendChild(renderer.domElement);

  const lights = createLights();
  lights.forEach((light) => scene.add(light));

  const hornet = await loadSuperHornet(scene, isMobile());

  // --- Ported landing: parallax + astronaut ---
  const landingRoot = document.querySelector<HTMLElement>('[data-parallax-root]');
  const astronautCanvas = document.getElementById('astronaut-canvas') as HTMLCanvasElement | null;

  const disposers: Array<() => void> = [];

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

  if (astronautCanvas) {
    // Render the astronaut over the landing section
    const landingSection = document.getElementById('home') ?? document.body;
    disposers.push(
      await initAstronautScene({
        canvas: astronautCanvas,
        container: landingSection,
        modelUrl: `${base}models/tenhun_falling_spaceman_fanart.glb`,
      })
    );
  }

  // --- Single RAF for DarkStar (astronaut has its own internal RAF) ---
  function animate() {
    requestAnimationFrame(animate);
    hornet?.update();
    renderer.render(scene, camera);
  }
  animate();

  // Optional cleanup hook (useful during HMR / future refactors)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__disposeWebsite3d = () => disposers.forEach((d) => d());
}

main().catch((e) => console.error(e));
