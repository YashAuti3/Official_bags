import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['axios'],
    exclude: ['devil-backend-nodejs'],  // ✅ Package ko bundle mat karo
  },
  resolve: {
    alias: {
      // ✅ Directly browser file point karo
      'devil-backend-nodejs': '/node_modules/devil-backend-nodejs/index.browser.js',
    },
  },
});
