import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const external = [];

export default {
    entry: 'src/app.js',
    format: 'iife',
    sourceMap: 'inline',
    external,
    plugins: [
        resolve({
            jsnext: true,
            main: true,
        }),
        commonjs({
            include: 'node_modules/**',
        }),
        babel({
            exclude: 'node_modules/**',
        }),
    ],
    dest: 'dist/app.min.js',
}