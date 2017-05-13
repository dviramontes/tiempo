import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import globals from 'rollup-plugin-node-globals';
import uglify from 'rollup-plugin-uglify';

const isProd = process.env.NODE_ENV === 'prod';

const external = [];

export default {
    entry: 'src/app.js',
    format: 'iife',
    sourceMap: 'inline',
    external,
    plugins: [
        resolve({ jsnext: true, browser: true, main: true }),
        commonjs({
            include: 'node_modules/**',
        }),
        eslint({
            exclude: [
                'src/styles/**'
            ],
        }),
        babel({
            exclude: 'node_modules/**',
        }),
        globals(),
        (isProd && uglify()),
    ],
    dest: 'dist/app.min.js',
}