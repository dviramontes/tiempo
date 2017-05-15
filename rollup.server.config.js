import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';

const external = [];

export default {
    entry: 'src/server.js',
    format: 'umd',
    external,
    plugins: [
        eslint(),
        babel({
            exclude: 'node_modules/**',
        }),
    ],
    dest: 'dist/server.umd.js',
}