import path from 'path'
import pkg from './package.json'

import clear from 'rollup-plugin-clear'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import ts from 'rollup-plugin-ts'
import { terser } from 'rollup-plugin-terser'

const isProduction = process.env.NODE_ENV === 'production'
const input = path.join(__dirname, 'src/index.ts')

function getPlugins(declaration) {
  return [
    clear({
      targets: ['dist']
    }),
    resolve(),
    commonjs(),
    ts({
      transpiler: 'swc',
      tsconfig: {
        declaration
      }
    })
  ]
}

/**
 * @typedef RollupOptions
 * @type {import('rollup').RollupOptions}
 */

/**
 * @returns {RollupOptions}
 */
function createDevConfig() {
  return {
    input,
    output: {
      name: pkg.global,
      file: pkg.main,
      format: 'umd',
      exports: 'auto',
      sourcemap: true,
      globals: {
        cesium: 'Cesium'
      }
    },
    plugins: getPlugins(true),
    external: 'cesium'
  }
}

/**
 * @returns {RollupOptions[]}
 */
function createProdConfig() {
  return [
    {
      input,
      output: {
        name: pkg.global,
        file: pkg.main,
        format: 'umd',
        exports: 'auto',
        sourcemap: true,
        globals: {
          cesium: 'Cesium'
        }
      },
      plugins: getPlugins(true),
      external: 'cesium'
    },
    {
      input,
      output: {
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
      plugins: getPlugins(),
      external: 'cesium'
    },
    {
      input,
      output: {
        file: pkg.module,
        format: 'esm',
        exports: 'auto',
        sourcemap: true,
        globals: {
          cesium: 'Cesium'
        }
      },
      plugins: getPlugins(),
      external: 'cesium'
    }
  ]
}

const config = isProduction ? createProdConfig() : createDevConfig()

export default config
