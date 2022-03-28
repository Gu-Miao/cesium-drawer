import path from 'path'
import pkg from './package.json'

import clear from 'rollup-plugin-clear'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import ts from 'rollup-plugin-ts'
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'

/** @type import('rollup').RollupOptions */
const config = {
  input: path.join(__dirname, 'src/index.ts'),
  output: [
    {
      name: pkg.global,
      file: pkg.browser,
      format: 'umd',
      exports: 'auto',
      sourcemap: true,
      plugins: [terser()],
      globals: {
        cesium: 'Cesium'
      }
    },
    {
      file: pkg.module,
      format: 'esm',
      exports: 'auto',
      sourcemap: true
    },
    {
      name: pkg.global,
      file: pkg.main,
      format: 'umd',
      exports: 'auto',
      sourcemap: true,
      globals: {
        cesium: 'Cesium'
      }
    }
  ],
  plugins: [
    clear({
      targets: ['build']
    }),
    resolve(),
    commonjs(),
    json(),
    ts({
      transpiler: 'swc'
    })
  ],

  external: 'cesium'
}

export default config
