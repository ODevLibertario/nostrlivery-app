module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
        ['module-resolver', {
            root: ['./src'],
            alias: {
                '@assets': './src/assets',
                '@components': './src/components',
                '@model': './src/model',
                '@screens': './src/screens',
                '@service': './src/service',
                '@util': './src/util',
            }
        }],
    ]
  };
};
