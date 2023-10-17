import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";
import Options from '@vitejs/plugin-react';

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
        src: 'node_modules/maplibre-gl/dist/maplibre-gl-csp-worker.js',
        dest: '.',
        rename: 'worker.js'
      }]
    })
  ];

  if (!isDev) {
    plugins.push(
      obfuscatorPlugin({
        options: {
          optionsPreset: 'high-obfuscation'
        }
      } as Options)
    )
  }

  return defineConfig({plugins});
};
