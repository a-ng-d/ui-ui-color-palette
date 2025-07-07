import path from 'path'
import { defineConfig, loadEnv, Plugin } from 'vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import preact from '@preact/preset-vite'

const excludeUnwantedCssPlugin = (): Plugin => {
  const excludePattern = /all/

  return {
    name: 'exclude-unwanted-css',
    enforce: 'pre',

    resolveId(id, importer) {
      if (id.endsWith('.css')) {
        const testPath = importer
          ? path.resolve(path.dirname(importer), id)
          : id

        if (excludePattern.test(testPath))
          return { id: '\0empty-module', external: false }
      }
      return null
    },

    load(id) {
      if (id === '\0empty-module')
        return { code: 'export default ""', map: null }
      return null
    },

    transformIndexHtml(html) {
      return html.replace(/<style[^>]*>\s*<\/style>/g, '')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const platform = env.PLATFORM || 'penpot'
  const colorMode = env.COLOR_MODE || 'dark'
  const editor = env.EDITOR || 'penpot'
  const isDev = mode === 'development'

  return {
    plugins: [
      excludeUnwantedCssPlugin(),
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
  }
})
