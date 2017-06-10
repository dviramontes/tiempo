import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

export default {
    entry: 'server/index.js',
    format: 'cjs',
    external,
    plugins: [
        eslint(),
        babel({
            exclude: 'node_modules/**',
        }),
    ],
    dest: 'dist/server.js',
}