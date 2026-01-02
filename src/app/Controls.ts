import * as THREE from 'three';

export type PointerRotationController = {
  update: () => void;
  dispose: () => void;
};

export type PointerRotationOptions = {
  element: HTMLElement;
  model: THREE.Object3D;
  invertHorizontal?: boolean;
  rotateSpeedX?: number;
  rotateSpeedY?: number;
  minRotationX?: number;
  maxRotationX?: number;
  minRotationY?: number;
  maxRotationY?: number;
  enableLean?: boolean;
  maxLeanX?: number;
  maxLeanY?: number;
  leanLerpSpeed?: number;
};

export function createPointerRotationController(
  opts: PointerRotationOptions
): PointerRotationController {
  const {
    element,
    model,
    invertHorizontal = true,
    rotateSpeedX = 0.05,
    rotateSpeedY = 0.05,
    maxRotationX = Math.PI / 3,
    minRotationX = -Math.PI / 4,
    maxRotationY = Math.PI + Math.PI / 4,
    minRotationY = Math.PI - Math.PI / 4,
    enableLean = window.matchMedia?.('(pointer: fine)')?.matches ?? true,
    maxLeanX = 1,
    maxLeanY = 1,
    leanLerpSpeed = 0.1,
  } = opts;

  model.rotation.y = Math.PI;

  let targetRotationX = 0;
  let targetRotationY = Math.PI;

  let targetPosX = 0;
  let targetPosY = 0;

  // Remember last pointer position so we can recompute targets when the page scrolls.
  let lastClientX = window.innerWidth / 2;
  let lastClientY = window.innerHeight / 2;
  let hasPointer = false;

  const ac = new AbortController();

  const calculateRotation = (clientX: number, clientY: number) => {
    const rect = element.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const x = (clientX - rect.left) / w;
    const y = (clientY - rect.top) / h;

    const normalizedX = x * 2 - 1;
    const normalizedY = y * 2 - 1;

    targetRotationY = Math.PI + (invertHorizontal ? -1 : 1) * normalizedX * Math.PI;
    targetRotationX = -normalizedY * Math.PI;

    if (enableLean) {
      targetPosX = normalizedX * maxLeanX;
      targetPosY = -normalizedY * maxLeanY;
    }
  };

  // Pointer events cover mouse + touch + pen and are easier to clean up.
  element.addEventListener(
    'pointermove',
    (event) => {
      hasPointer = true;
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      calculateRotation(event.clientX, event.clientY);
    },
    { passive: true, signal: ac.signal }
  );

  // If the page scrolls, the element's bounding rect changes; recompute using the last pointer position.
  window.addEventListener(
    'scroll',
    () => {
      if (!hasPointer) return;
      calculateRotation(lastClientX, lastClientY);
    },
    { passive: true, signal: ac.signal }
  );
  window.addEventListener(
    'wheel',
    () => {
      if (!hasPointer) return;
      calculateRotation(lastClientX, lastClientY);
    },
    { passive: true, signal: ac.signal }
  );

  const update = () => {
    // 🔁 Smooth rotation
    const nextY = model.rotation.y + (targetRotationY - model.rotation.y) * rotateSpeedY;
    model.rotation.y = THREE.MathUtils.clamp(nextY, minRotationY, maxRotationY);

    const nextX = model.rotation.x + (targetRotationX - model.rotation.x) * rotateSpeedX;
    model.rotation.x = THREE.MathUtils.clamp(nextX, minRotationX, maxRotationX);

    // 🪄 Smooth lean effect for desktop only
    if (enableLean) {
      model.position.x += (targetPosX - model.position.x) * leanLerpSpeed;
      model.position.y += (targetPosY - model.position.y) * leanLerpSpeed;
    }
  };

  const dispose = () => ac.abort();

  return { update, dispose };
}
