import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function damp(current: number, target: number, lambda: number, dt: number) {
  // Exponential smoothing (similar feel to maath/gsap damp)
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export async function initAstronautScene(opts: {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  container: HTMLElement; // used for pointer / sizing context
}) {
  const { canvas, modelUrl, container } = opts;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1, 3);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 1.1);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(2, 4, 2);
  scene.add(dir);

  const loader = new GLTFLoader();
  const gltf = await new Promise<{ scene: THREE.Group; animations: THREE.AnimationClip[] }>(
    (resolve, reject) => {
      loader.load(
        modelUrl,
        (res) =>
          resolve(res as unknown as { scene: THREE.Group; animations: THREE.AnimationClip[] }),
        undefined,
        (err) => reject(err)
      );
    }
  );

  const model = gltf.scene;
  model.rotation.set(-Math.PI / 2, -0.2, 2.2);
  model.scale.setScalar(0.3);
  model.position.set(1.3, 5, 0);
  scene.add(model);

  // If model contains animations, play first clip.
  let mixer: THREE.AnimationMixer | null = null;
  if (gltf.animations?.length) {
    mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();
  }

  // “Falling” spring-ish motion
  let targetY = -1;
  let y = 5;

  // Mouse camera rig
  const mouse = { x: 0, y: 0 };
  const onMove = (ev: PointerEvent) => {
    const r = container.getBoundingClientRect();
    const nx = ((ev.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
    const ny = ((ev.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;
    mouse.x = THREE.MathUtils.clamp(nx, -1, 1);
    mouse.y = THREE.MathUtils.clamp(ny, -1, 1);
  };
  container.addEventListener('pointermove', onMove, { passive: true });

  const resize = () => {
    const r = container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width));
    const h = Math.max(1, Math.floor(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let last = performance.now();
  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const now = performance.now();
    const dt = clamp01((now - last) / 1000);
    last = now;

    // fall + gentle float
    y = damp(y, targetY, 3.5, dt);
    model.position.y = y + Math.sin(now * 0.001) * 0.06;

    // subtle rotation wobble
    model.rotation.z += 0.15 * dt;

    // camera rig (like portfolio Rig: [mouse.x/10, 1+mouse.y/10, 3])
    const desired = new THREE.Vector3(mouse.x / 10, 1 + mouse.y / 10, 3);
    camera.position.set(
      damp(camera.position.x, desired.x, 6, dt),
      damp(camera.position.y, desired.y, 6, dt),
      damp(camera.position.z, desired.z, 6, dt)
    );
    camera.lookAt(0, 0.5, 0);

    if (mixer) mixer.update(dt);
    renderer.render(scene, camera);
  };
  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    container.removeEventListener('pointermove', onMove);
    renderer.dispose();
    mixer?.stopAllAction();
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      const mat = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
  };
}


