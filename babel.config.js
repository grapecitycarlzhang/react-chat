module.exports = function (api) {
    api.cache(true);
    const presets = [
        [
            '@babel/preset-env',
            {
                modules: ['esm'].includes(process.env.BABEL_ENV) ? false : 'commonjs',
            },
        ],
        "@babel/typescript",
        "@babel/react"
    ];
    const plugins = [
        [
            '@babel/plugin-proposal-class-properties',
            {
                loose: true
            }
        ],
        [
            '@babel/plugin-proposal-object-rest-spread',
            {
                loose: true
            }
        ],
        '@babel/plugin-transform-runtime',
        // for IE 11 support
        '@babel/plugin-transform-object-assign',
    ];
    return {
        presets,
        plugins,
        ignore: [/@babel[\\|/]runtime/],
        env: {
            // cjs: {
            // },
            esm: {
                plugins: [
                    ['@babel/plugin-transform-runtime', {
                        useESModules: true
                    }]
                ],
            },
        },
    }
}