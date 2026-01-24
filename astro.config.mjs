// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.tinyfat.com',
  output: 'server',
  adapter: cloudflare(),
});
