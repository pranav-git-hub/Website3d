import * as THREE from 'three';

function getSize(el: HTMLElement) {
  return {
    width: Math.max(1, el.clientWidth),
    height: Math.max(1, el.clientHeight),
  };
}

export function createRenderer(container: HTMLElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const { width, height } = getSize(container);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);

  const ro = new ResizeObserver(() => {
    const next = getSize(container);
    renderer.setSize(next.width, next.height, false);
  });
  ro.observe(container);

  // Expose a tiny hook so callers can clean up if needed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (renderer as any).__resizeObserver = ro;
  return renderer;
}
