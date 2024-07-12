import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import external from 'rollup-plugin-peer-deps-external';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import analyze from 'rollup-plugin-analyzer';
import { terser } from 'rollup-plugin-terser';

/* eslint-disable import/no-anonymous-default-export */
export default {
    input: './src/index.js',
    output: [
        // { file: pkg.main, format: 'cjs', sourcemap: true },
        {
            file: 'dist/index.es.js',
            format: 'es',
            exports: 'auto',
        },
    ],
    external: [/node_modules/],
    plugins: [
        // postcss({ plugins: [], minimize: true }),
        external(),
        babel({
            exclude: 'node_modules/**',
            presets: ['@babel/preset-react'],
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development'),
            preventAssignment: true,
        }),
        resolve(),
        commonjs(),
        terser(),
        analyze({ summaryOnly: true, hideDeps: true }),
    ],
};
