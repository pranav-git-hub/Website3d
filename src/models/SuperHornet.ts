import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { addMouseRotation } from '../app/Controls.ts';

export async function loadSuperHornet(
  scene: THREE.Scene,
  useSmall: boolean
): Promise<{ model: THREE.Object3D; update: () => void } | null> {
  const loader = new GLTFLoader();
  const modelPath = useSmall ? 'assets/DarkStarSmall.glb' : 'assets/DarkStar.glb';

  return await new Promise((resolve) => {
    loader.load(
      modelPath,
      (modelResult) => {
        const model = modelResult.scene;
        model.scale.set(0.5, 0.5, 0.5);
        scene.add(model);

        const updateRotation = addMouseRotation(model);
        resolve({ model, update: updateRotation });
      },
      undefined,
      (error) => {
        console.error('Error loading GLB:', error);
        resolve(null);
      }
    );
  });
}
