import mdx from '@astrojs/mdx'
import svelte from '@astrojs/svelte'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Full Astro Configuration API Documentation:
// https://docs.astro.build/reference/configuration-reference

// @type-check enabled!
// @ts-check
export default /** @type {import('astro').AstroUserConfig} */ ({
  // root: '.',
  // outDir: './dist',
  // publicDir: './public',

  site: 'https://rubek.dev',
  server: {
    // port: 3000,
  },
  integrations: [
    mdx(),
    svelte(),
    tailwind({
        config: {
            applyBaseStyles: false
        },
    }),
    sitemap()
  ],
  vite: {
    plugins: [],
    resolve: {
        alias: {
          '$': path.resolve(__dirname, './src'),
        },
    },
    optimizeDeps: {
        allowNodeBuiltins: true
    }
  }
});
