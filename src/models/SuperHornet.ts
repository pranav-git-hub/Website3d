import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { createPointerRotationController } from '../app/Controls';
import { disposeObject3D } from '../app/threeDispose';

type LoadSuperHornetOptions = {
  scene: THREE.Scene;
  container: HTMLElement;
  baseUrl: string;
  useSmall: boolean;
};

function resolveAssetUrl(baseUrl: string, path: string) {
  // baseUrl is typically Vite's BASE_URL (e.g. "/Website3d/")
  const base = new URL(baseUrl, window.location.href);
  return new URL(path.replace(/^\//, ''), base).toString();
}

export async function loadSuperHornet(
  opts: LoadSuperHornetOptions
): Promise<{ model: THREE.Object3D; update: () => void; dispose: () => void } | null> {
  const loader = new GLTFLoader();
  const modelPath = resolveAssetUrl(
    opts.baseUrl,
    opts.useSmall ? 'assets/DarkStarSmall.glb' : 'assets/DarkStar.glb'
  );

  return await new Promise((resolve) => {
    loader.load(
      modelPath,
      (modelResult) => {
        const model = modelResult.scene;
        model.scale.set(0.5, 0.5, 0.5);
        opts.scene.add(model);

        const controller = createPointerRotationController({
          element: opts.container,
          model,
        });

        const dispose = () => {
          controller.dispose();
          opts.scene.remove(model);
          disposeObject3D(model);
        };

        resolve({ model, update: controller.update, dispose });
      },
      undefined,
      (error) => {
        console.error('Error loading GLB:', error);
        resolve(null);
      }
    );
  });
}
