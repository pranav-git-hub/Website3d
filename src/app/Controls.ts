import * as THREE from 'three';

// ✨ Configurable constants
const ROTATE_SPEED_X = 0.05; // Up/Down damping
const ROTATE_SPEED_Y = 0.05; // Left/Right damping
const INVERT_HORIZONTAL = true;

// Limits for vertical rotation
const MAX_ROTATION_X = Math.PI / 3;  // ~+30°
const MIN_ROTATION_X = -Math.PI / 4; // ~-30°

// Limits for horizontal rotation (around PI)
const MAX_ROTATION_Y = Math.PI + Math.PI / 4;  // ~198°
const MIN_ROTATION_Y = Math.PI - Math.PI / 4;  // ~162°

export function addMouseRotation(model: THREE.Object3D) {
  // ⬅️ Start rotated 180 degrees left-right
  model.rotation.y = Math.PI;

  let targetRotationX = 0;
  let targetRotationY = Math.PI;

  // 📦 Normalize input and calculate target rotations
  const calculateRotation = (x: number, y: number) => {
    const normalizedX = (x / window.innerWidth) * 2 - 1;
    const normalizedY = (y / window.innerHeight) * 2 - 1;

    targetRotationY = Math.PI + (INVERT_HORIZONTAL ? -1 : 1) * normalizedX * Math.PI;
    targetRotationX = -normalizedY * Math.PI;
  };

  // 🖱️ Mouse
  document.addEventListener('mousemove', (event) => {
    calculateRotation(event.clientX, event.clientY);
  });

  // 🤏 Touch
  document.addEventListener('touchmove', (event) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      calculateRotation(touch.clientX, touch.clientY);
    }
  }, { passive: true });

  // 🔄 Dampened rotation updates
  return function updateRotation() {
    // Smooth Y (left-right)
    const nextY = model.rotation.y + (targetRotationY - model.rotation.y) * ROTATE_SPEED_Y;
    model.rotation.y = THREE.MathUtils.clamp(nextY, MIN_ROTATION_Y, MAX_ROTATION_Y);

    // Smooth X (up-down) with clamping
    const nextX = model.rotation.x + (targetRotationX - model.rotation.x) * ROTATE_SPEED_X;
    model.rotation.x = THREE.MathUtils.clamp(nextX, MIN_ROTATION_X, MAX_ROTATION_X);
  };
}
