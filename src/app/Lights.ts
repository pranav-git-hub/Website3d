import * as THREE from 'three';

export function createLights(): THREE.Light[] {
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  return [light];
}
