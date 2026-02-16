import { defineConfig } from 'vite';

export default defineConfig({
  base: '/sofik-game-aro/',
  build: {
    assetsDir: 'assets', // Ensure assets are grouped
  },
  server: {
    host: true // Expose to network for mobile testing
  }
});
