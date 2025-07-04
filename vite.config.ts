import { defineConfig, loadEnv } from 'vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import preact from '@preact/preset-vite'

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
    ],

    define: {
      __PLATFORM__: JSON.stringify(platform),
      __COLOR_MODE__: JSON.stringify(colorMode),
      __EDITOR__: JSON.stringify(editor),
    },

    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },

    server: {
      port: 4400,
      watch: {
        usePolling: false,
        ignored: ['**/node_modules/**', '!**/node_modules/@a_ng_d/**'],
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 4400,
        clientPort: 4400,
        timeout: 20000,
        overlay: true,
        preserveState: false,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },

    build: {
      sourcemap: isDev,
      minify: !isDev,
      outDir: 'dist',
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
  }
})
