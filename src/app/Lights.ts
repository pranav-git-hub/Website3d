import * as THREE from 'three';

export function createLights(): THREE.Light[] {
  const ambient = new THREE.AmbientLight(0xffffff, 0.45);

  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.position.set(5, 6, 4);

  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(-5, 2, -2);

  return [ambient, key, fill];
}
