src/
├── main.ts                # Entry point: sets up scene, camera, renderer, loop
├── app/
│   ├── SceneManager.ts    # Controls scene creation and animation loop
│   ├── Renderer.ts        # WebGLRenderer setup
│   ├── Camera.ts          # Perspective camera setup
│   ├── Lights.ts          # Lighting setup
│   └── Controls.ts        # OrbitControls or input handling
├── models/
│   ├── loadModel.ts       # Function to load GLTF/GLB models
│   ├── SuperHornet.ts     # Specific model loading, animations, etc.
├── utils/
│   └── mobileCheck.ts     # Utility to detect mobile
├── style.css              # Global styles
