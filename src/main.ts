import * as THREE from 'three';
import { createCamera } from './app/Camera.ts';
import { createRenderer } from './app/Renderer.ts';
import { createLights } from './app/Lights.ts';
import { loadSuperHornet } from './models/SuperHornet.ts';
import { isMobile } from './utils/mobileCheck.ts';


const scene = new THREE.Scene();
const camera = createCamera();
scene.userData.camera = camera; // 🔁 Share camera with other modules

const renderer = createRenderer();
document.body.appendChild(renderer.domElement);

const lights = createLights();
lights.forEach((light) => scene.add(light));

loadSuperHornet(scene, renderer, isMobile());

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
