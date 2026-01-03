import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isAnalyze = mode === 'analyze';
  return {
    // Default to GitHub Pages base; override with VITE_BASE="/" for other hosting.
    base: env.VITE_BASE ?? '/Website3d/',
    plugins: [
      react(),
      isAnalyze &&
        visualizer({
          filename: 'dist/bundle-report.html',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
          open: true,
        }),
    ].filter(Boolean),
  };
});


