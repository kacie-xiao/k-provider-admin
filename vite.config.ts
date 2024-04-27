import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';
import visualizer from 'rollup-plugin-visualizer';
import tailwindcss from 'tailwindcss';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver, NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { ConfigEnv, defineConfig, loadEnv } from 'vite';
import viteCompression from 'vite-plugin-compression';
import vueSetupExtend from 'vite-plugin-vue-setup-extend-plus';

import { buildConfig } from './src/utils/build';

const alias: Record<string, string> = {
  '@': resolve(__dirname, 'src'),
  'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
};

// @ts-ignore
const viteConfig = defineConfig((mode: ConfigEnv) => {
  const env = loadEnv(mode.mode, process.cwd());
  return {
    plugins: [
      vue(),
      vueSetupExtend(),
      visualizer({ emitFile: false, gzipSize: true }),
      AutoImport({
        imports: [
          'vue',
          {
            'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
          },
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver(), ElementPlusResolver()],
      }),
      viteCompression(),
      JSON.parse(env.VITE_OPEN_CDN) ? buildConfig.cdn() : null,
    ],
    root: process.cwd(),
    resolve: { alias, extensions: ['.js', '.ts', '.tsx', '.jsx'] },
    base: mode.command === 'serve' ? './' : env.VITE_PUBLIC_PATH,
    optimizeDeps: { exclude: ['vue-demi'] },
    server: {
      host: true,
      port: env.VITE_PORT as unknown as number,
      open: JSON.parse(env.VITE_OPEN),
      strictPort: true,
      hmr: true,
      proxy: {
        '/api': {
          target: '',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/upload': {
          target: '',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/upload/, ''),
        },
        '/weixin': {
          target: 'https://api.weixin.qq.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/weixin/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return (
                id.toString().match(/\/node_modules\/(?!.pnpm)(?<moduleName>[^\/]*)\//)?.groups!.moduleName ?? 'vender'
              );
            }
          },
        },
        ...(JSON.parse(env.VITE_OPEN_CDN) ? { external: buildConfig.external } : {}),
      },
    },
    css: {
      preprocessorOptions: { css: { charset: false } },
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    define: {
      __VUE_I18N_LEGACY_API__: JSON.stringify(false),
      __VUE_I18N_FULL_INSTALL__: JSON.stringify(false),
      __INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
      __NEXT_VERSION__: JSON.stringify(process.env.npm_package_version),
      __NEXT_NAME__: JSON.stringify(process.env.npm_package_name),
    },
  };
});

export default viteConfig;
