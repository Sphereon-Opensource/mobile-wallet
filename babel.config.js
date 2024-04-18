module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],

    plugins: [
      '@babel/plugin-syntax-import-assertions',
      'module:react-native-dotenv',
      ['@babel/plugin-proposal-decorators', {legacy: true}],
      [
        'module-resolver',
        {
          alias: {
            'react-native-sqlite-storage': 'react-native-quick-sqlite',
          },
        },
      ],
    ],
  };
};
