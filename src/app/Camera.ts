import * as THREE from 'three';

import { observeElementSize } from './observeElementSize';

export type CreateCameraOptions = {
  onResize?: () => void;
};

export function createCamera(
  container: HTMLElement,
  opts: CreateCameraOptions = {}
): {
  camera: THREE.PerspectiveCamera;
  dispose: () => void;
} {
  const { onResize } = opts;
  const width = Math.max(1, container.clientWidth);
  const height = Math.max(1, container.clientHeight);
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  const dispose = observeElementSize(container, (nextWidth, nextHeight) => {
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    onResize?.();
  });

  return { camera, dispose };
}
