import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import copy from 'rollup-plugin-copy';

const external = [];

export default {
    entry: 'server/index.js',
    format: 'umd',
    external,
    plugins: [
        eslint(),
        babel({
            exclude: 'node_modules/**',
        }),
        copy({
            'index.html': 'public/index.html',
            'dist/main.min.css': 'public/main.min.css',
            'dist/client.min.js': 'public/client.min.js',
            verbose: true
        })
    ],
    dest: 'dist/server.umd.js',
}