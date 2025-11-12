import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import wasm from 'vite-plugin-wasm';
import path from 'path';
import { readFileSync } from 'fs';

export default defineConfig(({ mode }) => {
    // Read version from the appropriate package.json
    const pkgPath = mode === 'development'
        ? path.resolve(__dirname, '../pkg/package.json')
        : path.resolve(__dirname, 'node_modules/qlue-ls/package.json');

    let qlueLsVersion = '0.0.0';
    try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        qlueLsVersion = pkg.version;
    } catch (e) {
        console.warn(`Could not read qlue-ls version from ${pkgPath}:`, e);
    }

    return {
        define: {
            '__QLUE_LS_VERSION__': JSON.stringify(qlueLsVersion)
        },
        optimizeDeps: {
            include: [
                '@testing-library/react',
                'vscode/localExtensionHost',
                'vscode-textmate',
                'vscode-oniguruma'
            ]
        },
        resolve: {
            alias: mode === 'development' ? {
                'qlue-ls': path.resolve(__dirname, '../pkg'),
                'll-sparql-parser': path.resolve(__dirname, '../crates/parser/pkg')
            } : {}
        },
        server: {
            allowedHosts: true,
            fs: {
                strict: false
            }
        },
        worker: {
            format: 'es',
            plugins: () => [wasm()]
        },
        plugins: [sveltekit(), tailwindcss(), wasm()]
    };
});
