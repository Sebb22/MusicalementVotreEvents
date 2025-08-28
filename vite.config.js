import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: 'assets',
    build: {
        outDir: '../public',
        emptyOutDir: false,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'assets/js/main.js'),
            },
            output: {
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/[name].js',
                assetFileNames: ({ name }) => {
                    if (name && name.endsWith('.css')) return 'css/[name]';
                    return 'assets/[name]';
                },
            },
        },
    },
});