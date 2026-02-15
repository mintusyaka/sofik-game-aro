import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true // Expose to network for mobile testing
  }
});
