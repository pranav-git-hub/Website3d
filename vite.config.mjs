import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // Default to GitHub Pages base; override with VITE_BASE="/" for other hosting.
    base: env.VITE_BASE ?? '/Website3d/',
    plugins: [react()],
  };
});


