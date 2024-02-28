import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import { obfuscator } from 'rollup-obfuscator';
import Options from '@vitejs/plugin-react';

const splitToChunks = true;

// https://vitejs.dev/config/
export default ({mode}) => {
  const isDev = mode === 'development';

  const plugins = [
    react(
      isDev ? {
        babel: {
          plugins: [
            [
              "babel-plugin-styled-components",
              {
                ssr: false,
                pure: true,
                displayName: true,
                fileName: true,
                minify: false
              },
            ],
          ],
        },
      } : undefined
    ),
    tsconfigPaths(),
    svgr(),
    viteStaticCopy({
      targets: [{
        src: 'node_modules/map-fonts/*',
        dest: 'map-styles/fonts'
      }, {
        src: 'node_modules/mapbox-gl/dist/mapbox-gl-csp-worker.js',
        dest: '.',
        rename: 'worker.js'
      }]
    })
  ];

  if (!isDev) {
    plugins.push(
      obfuscator({
        options: {
          optionsPreset: 'high-obfuscation'
        }
      } as Options)
    )
  }

  const cnf = {
    plugins
  }

  if (splitToChunks) {
    const names = [];
    cnf.build = {
      rollupOptions: {
        output:{
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const packageName = id.toString().split('node_modules/')[1].split('/')[0].toString();
              let index = names.indexOf(packageName);
              if (index === -1) {
                index = names.push(packageName) - 1;
              }
              return `pack${index}`;
            }
          }
        }
      }
    }
  }

  return defineConfig(cnf);
};
