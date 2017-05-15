import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import globals from 'rollup-plugin-node-globals';
import uglify from 'rollup-plugin-uglify';
import less from 'rollup-plugin-less';

const isProd = process.env.NODE_ENV === 'prod';

const external = [];

export default {
    entry: 'src/client.js',
    format: 'iife',
    sourceMap: 'inline',
    external,
    plugins: [
        less({
            output: './dist/main.min.css'
        }),
        resolve({ jsnext: true, browser: true, main: true }),
        commonjs({
            include: 'node_modules/**',
        }),
        eslint(),
        babel({
            exclude: 'node_modules/**',
        }),
        globals(),
        (isProd && uglify()),
    ],
    dest: 'dist/client.min.js',
}