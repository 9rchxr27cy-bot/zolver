import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Only split vendor dependencies (no app code splitting)
            if (id.includes('node_modules')) {
              // Firebase - large standalone library
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              // React ecosystem - keep together to avoid circular deps
              if (id.includes('react') || id.includes('react-dom') ||
                id.includes('react-router') || id.includes('framer-motion')) {
                return 'vendor-react';
              }
              // All other vendor code
              return 'vendor';
            }
            // NO app code splitting - everything else stays in main bundle
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  };
});
