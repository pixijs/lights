import buble from 'rollup-plugin-buble';
import string from 'rollup-plugin-string';
import uglify from 'rollup-plugin-uglify';
import conditional from 'rollup-plugin-conditional';
import eslint from 'rollup-plugin-eslint';
import { minify } from 'uglify-es';
import pkg from './package.json';

const banner = [
    '/*!',
    ` * ${pkg.name} - v${pkg.version}`,
    ` * Compiled ${(new Date()).toUTCString().replace(/GMT/g, 'UTC')}`,
    ' *',
    ` * ${pkg.name} is licensed under the MIT License.`,
    ' * http://www.opensource.org/licenses/mit-license',
    ' */',
].join('\n');

export default {
    input: 'src/index.js',
    output: [
        {
            name: 'PIXI.lights',
            freeze: false,
            file: pkg.main,
            sourcemap: true,
            format: 'umd',
            banner
        },
        {
            freeze: false,
            file: pkg.module,
            sourcemap: true,
            format: 'es',
            banner
        },
    ],
    plugins: [
        eslint({
            throwOnError: true,
            include: 'src/**.js'
        }),
        string({
            include: [
                '**/*.frag',
                '**/*.vert',
                '**/*.glsl'
            ]
        }),
        buble(),
        conditional(process.env.NODE_ENV !== 'development', [
            uglify({
                mangle: true,
                compress: true,
                output: {
                    comments: function(node, comment) {
                        return comment.line === 1;
                    }
                }
            }, minify)
        ])
    ]
};