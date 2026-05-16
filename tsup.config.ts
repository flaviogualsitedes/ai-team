import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node20',
  splitting: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  // Copiar arquivos estáticos (locales, templates) para dist
  publicDir: 'src/templates',
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    };
  },
});
