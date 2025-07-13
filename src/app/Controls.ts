import * as THREE from 'three';

// ✨ Configurable constants
const ROTATE_SPEED_X = 0.05; // Up/Down damping
const ROTATE_SPEED_Y = 0.05; // Left/Right damping
const INVERT_HORIZONTAL = true;

// Limits for vertical rotation
const MAX_ROTATION_X = Math.PI / 3;
const MIN_ROTATION_X = -Math.PI / 4;

// Limits for horizontal rotation (centered around PI)
const MAX_ROTATION_Y = Math.PI + Math.PI / 4;
const MIN_ROTATION_Y = Math.PI - Math.PI / 4;

// ✨ Lean/Positioning (desktop only)
const ENABLE_LEAN = !/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent); // desktop only
const MAX_POSITION_OFFSET_X = 1; // How far to lean left/right
const MAX_POSITION_OFFSET_Y = 1; // How far to lean up/down
const POSITION_LERP_SPEED = 0.1;

export function addMouseRotation(model: THREE.Object3D) {
  model.rotation.y = Math.PI;

  let targetRotationX = 0;
  let targetRotationY = Math.PI;

  let targetPosX = 0;
  let targetPosY = 0;

  const calculateRotation = (x: number, y: number) => {
    const normalizedX = (x / window.innerWidth) * 2 - 1;
    const normalizedY = (y / window.innerHeight) * 2 - 1;

    targetRotationY = Math.PI + (INVERT_HORIZONTAL ? -1 : 1) * normalizedX * Math.PI;
    targetRotationX = -normalizedY * Math.PI;

    // ✨ Also calculate target position (for lean)
    if (ENABLE_LEAN) {
      targetPosX = normalizedX * MAX_POSITION_OFFSET_X;
      targetPosY = -normalizedY * MAX_POSITION_OFFSET_Y;
    }
  };

  // Mouse for desktop
  if (ENABLE_LEAN) {
    document.addEventListener('mousemove', (event) => {
      calculateRotation(event.clientX, event.clientY);
    });
  }

  // Touch for mobile
  else {
    document.addEventListener('touchmove', (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        calculateRotation(touch.clientX, touch.clientY);
      }
    }, { passive: true });
  }

  return function updateRotation() {
    // 🔁 Smooth rotation
    const nextY = model.rotation.y + (targetRotationY - model.rotation.y) * ROTATE_SPEED_Y;
    model.rotation.y = THREE.MathUtils.clamp(nextY, MIN_ROTATION_Y, MAX_ROTATION_Y);

    const nextX = model.rotation.x + (targetRotationX - model.rotation.x) * ROTATE_SPEED_X;
    model.rotation.x = THREE.MathUtils.clamp(nextX, MIN_ROTATION_X, MAX_ROTATION_X);

    // 🪄 Smooth lean effect for desktop only
    if (ENABLE_LEAN) {
      model.position.x += (targetPosX - model.position.x) * POSITION_LERP_SPEED;
      model.position.y += (targetPosY - model.position.y) * POSITION_LERP_SPEED;
    }
  };
}
