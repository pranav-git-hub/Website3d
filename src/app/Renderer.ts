import * as THREE from 'three';

import { observeElementSize } from './observeElementSize';

export type CreateRendererOptions = {
  maxDpr?: number;
  antialias?: boolean;
  onResize?: () => void;
};

export function createRenderer(
  container: HTMLElement,
  opts: CreateRendererOptions = {}
): {
  renderer: THREE.WebGLRenderer;
  dispose: () => void;
} {
  const { maxDpr = 2, antialias = true, onResize } = opts;

  const renderer = new THREE.WebGLRenderer({
    antialias,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  let lastDpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(lastDpr);
  renderer.setSize(
    Math.max(1, container.clientWidth),
    Math.max(1, container.clientHeight),
    false
  );

  const disposeObserver = observeElementSize(container, (width, height) => {
    const nextDpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    if (nextDpr !== lastDpr) {
      lastDpr = nextDpr;
      renderer.setPixelRatio(nextDpr);
    }
    renderer.setSize(width, height, false);
    onResize?.();
  });

  const dispose = () => {
    disposeObserver();
    renderer.dispose();
  };

  return { renderer, dispose };
}
