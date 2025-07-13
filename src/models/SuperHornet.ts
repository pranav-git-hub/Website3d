import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { addMouseRotation } from '../app/Controls.ts';

export function loadSuperHornet(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  useSmall: boolean
) {
  const loader = new GLTFLoader();
  const modelPath = useSmall ? 'assets/DarkStarSmall.glb' : 'assets/DarkStar.glb';
  loader.load(modelPath, (modelResult) => {
    const model = modelResult.scene;
      model.scale.set(0.5, 0.5, 0.5);
      scene.add(model);

      const updateRotation = addMouseRotation(model);

      // ⛓ Hook into the animation loop using renderer
      function animate() {
        requestAnimationFrame(animate);
        updateRotation();
        renderer.render(scene, scene.userData.camera); // use camera from scene.userData
      }

      animate();
    },
    undefined,
    (error) => {
      console.error('Error loading GLB:', error);
    }
  );
}
