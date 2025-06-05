import preact from '@preact/preset-vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const platform = env.PLATFORM || 'penpot'
  const colorMode = env.COLOR_MODE || 'dark'
  const editor = env.EDITOR || 'penpot'
  const isDev = mode === 'development'

  return {
    plugins: [
      preact(),
      sentryVitePlugin({
        org: 'yelbolt',
        project: 'ui-color-palette',
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
      // basicSsl(),
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
      watch: {
        usePolling: false,
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 4400,
        clientPort: 4400,
        timeout: 20000,
        overlay: true,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
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
