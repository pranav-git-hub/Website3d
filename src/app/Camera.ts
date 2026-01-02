import * as THREE from 'three';

function getSize(el: HTMLElement) {
  return {
    width: Math.max(1, el.clientWidth),
    height: Math.max(1, el.clientHeight),
  };
}

export function createCamera(container: HTMLElement): THREE.PerspectiveCamera {
  const { width, height } = getSize(container);
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  const ro = new ResizeObserver(() => {
    const next = getSize(container);
    camera.aspect = next.width / next.height;
    camera.updateProjectionMatrix();
  });
  ro.observe(container);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (camera as any).__resizeObserver = ro;
  return camera;
}
