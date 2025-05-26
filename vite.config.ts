import preact from '@preact/preset-vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(async ({ mode }) => {
  const platform = process.env.PLATFORM || 'penpot'
  const colorMode = process.env.COLOR_MODE || 'dark'
  const editor = process.env.EDITOR || 'penpot'
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'

  return {
    plugins: [
      preact(),
      sentryVitePlugin({
        org: 'yelbolt',
        project: 'ui-color-palette',
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
      basicSsl(),
    ],

    define: {
      __PLATFORM__: JSON.stringify(platform),
      __COLOR_MODE__: JSON.stringify(colorMode),
      __EDITOR__: JSON.stringify(editor),
    },

    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },

    server: {
      port: 4400,
      https: {
        cert: '',
        key: '',
      },
      watch: {
        usePolling: true,
        interval: 1000,
      },
      hmr: {
        protocol: 'wss',
        host: 'localhost',
        port: 4400,
        overlay: true,
      },
    },

    build: {
      sourcemap: isDev,
      minify: !isDev,
      outDir: 'dist',
      watch: isDev ? {} : null,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: 'index.html',
          iframe: 'iframe.html',
        },
        output: {
          dir: 'dist',
          entryFileNames: '[name].js',
          assetFileNames: 'assets/[name].[hash][extname]',
        },
      },
    },

    preview: {
      port: 4400,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  }
})
