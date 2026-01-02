import * as THREE from 'three';

import { observeElementSize } from './observeElementSize';

export function createRenderer(container: HTMLElement): {
  renderer: THREE.WebGLRenderer;
  dispose: () => void;
} {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(
    Math.max(1, container.clientWidth),
    Math.max(1, container.clientHeight),
    false
  );

  const disposeObserver = observeElementSize(container, (width, height) => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
  });

  const dispose = () => {
    disposeObserver();
    renderer.dispose();
  };

  return { renderer, dispose };
}
