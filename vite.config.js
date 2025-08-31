import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@js': path.resolve(__dirname, 'assets/js'),
            '@scss': path.resolve(__dirname, 'assets/scss'),
            '@images': path.resolve(__dirname, 'assets/images'),
        },
    },
    server: {
        port: 5173,
        strictPort: true,
        open: true,
        proxy: {
            // redirige tout ce qui n'est pas JS/CSS vers PHP
            '/': {
                target: 'http://localhost:8000/', // ton serveur PHP
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: 'public',
        emptyOutDir: false,
        rollupOptions: {
            input: path.resolve(__dirname, 'assets/js/main.js'),
            output: {
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/[name].js',
                assetFileNames: ({ name }) =>
                    name && name.endsWith('.css') ? 'css/[name]' : 'assets/[name]',
            },
        },
    },
});