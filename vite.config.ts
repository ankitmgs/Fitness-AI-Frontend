import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:5000')
      },
      resolve: {
        alias: {
          // FIX: __dirname is not available in ES modules. Using import.meta.url is the modern approach to get the current directory path.
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      }
    };
});