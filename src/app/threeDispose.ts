import * as THREE from 'three';

function disposeMaterial(mat: THREE.Material) {
  // Textures can live on many known material slots; dispose whatever exists.
  const maybe = mat as unknown as Record<string, unknown>;
  for (const v of Object.values(maybe)) {
    if (v instanceof THREE.Texture) v.dispose();
  }
  mat.dispose();
}

/**
 * Best-effort disposal for scenes/models. Call this when you remove a subtree
 * from the scene to avoid leaking GPU resources.
 */
export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as unknown as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();

    const material = (mesh as unknown as { material?: THREE.Material | THREE.Material[] }).material;
    if (Array.isArray(material)) material.forEach(disposeMaterial);
    else if (material) disposeMaterial(material);
  });
}


