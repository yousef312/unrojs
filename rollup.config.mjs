import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/unro.js',
    output: [
      {
        file: 'dist/unro.umd.js',
        format: 'umd',
        name: 'unro',
        sourcemap: true,
      },
      {
        file: 'dist/unro.umd.min.js',
        format: 'umd',
        name: 'unro',
        plugins: [terser()],
        sourcemap: true,
      },
      {
        file: 'dist/unro.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/unro.cjs.js',
        format: 'cjs',
        sourcemap: true,
      }
    ],
    plugins: [
      resolve(),
      commonjs()
    ]
  }
];