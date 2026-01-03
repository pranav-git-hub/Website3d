Pranav's Website3d (React + R3F)

Quick start
1) Install
   npm install

2) Dev server
   npm run dev

   Note: This project is configured for a GitHub Pages base path by default:
     /Website3d/
   So the dev URL will typically be:
     http://localhost:5173/Website3d/

3) Typecheck / Build / Preview
   npm run typecheck
   npm run build
   npm run preview

3b) Bundle report (what’s in the JS bundle)
   npm run analyze

4) Deploy (GitHub Pages)
   npm run deploy

Project notes
- UI is React (entry: src/main.tsx, router: src/App.tsx).
- 3D is React Three Fiber (src/components/DarkstarCanvas.tsx) loading public/assets/DarkStar*.glb.
- Landing effects are DOM-driven modules (src/landing/*) bridged from React in src/components/Landing.tsx.