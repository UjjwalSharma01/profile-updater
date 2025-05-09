import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'index.js',
  output: {
    file: '../dist/bundle.js',
    format: 'es'
  },
  external: ['puppeteer-core'],
  plugins: [
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs()
  ]
};
