src/
├── main.ts                # Entry point: bootstraps Three.js + landing effects, starts RAF, sets up disposal
├── app/
│   ├── Renderer.ts        # WebGLRenderer setup (container-sized + disposable)
│   ├── Camera.ts          # Perspective camera setup (container-sized + disposable)
│   ├── Lights.ts          # Lighting setup (ambient + directional lights)
│   ├── Controls.ts        # Pointer-driven rotation/lean controller for the model (returns update + dispose)
│   ├── observeElementSize.ts # ResizeObserver helper used by Camera/Renderer
│   └── threeDispose.ts    # Best-effort disposal of geometries/materials/textures
├── models/
│   └── SuperHornet.ts     # Loads the DarkStar GLB + wires pointer rotation; returns update + dispose
├── landing/
│   ├── parallax.ts        # DOM parallax layers driven by spring-smoothed scroll progress
│   └── flipWords.ts       # Headline flip-words animation (DOM + timers + CSS classes)
├── utils/
│   └── mobileCheck.ts     # Utility to detect mobile
├── style.css              # Global styles
