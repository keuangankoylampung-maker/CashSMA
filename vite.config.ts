import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // 1. Menaikkan batas peringatan ukuran chunk menjadi 1000 kB
      chunkSizeWarningLimit: 1000,
      
      // 2. Memisahkan library besar (node_modules) agar tidak menumpuk di satu file
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Memisahkan core react agar menjadi chunk tersendiri
              if (id.includes('react')) {
                return 'vendor-react';
              }
              return 'vendor-others';
            }
          },
        },
      },
    },
  };
});
