const createAppConfig = () => ({
  presets: ['@babel/preset-env'],
  // Support for dynamic imports
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-object-rest-spread',
  ],
});

module.exports = {
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
      ],
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
    development: createAppConfig(),
    production: createAppConfig(),
  },
};
