module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],

    plugins: [
      '@babel/plugin-syntax-import-assertions',
      'module:react-native-dotenv',
      'babel-plugin-transform-typescript-metadata',
      ['@babel/plugin-proposal-decorators', {legacy: true}],
      ['@babel/plugin-proposal-class-properties', {loose: true}],
      [
        'module-resolver',
        {
          alias: {
            'react-native-sqlite-storage': 'react-native-quick-sqlite',
            crypto: 'react-native-quick-crypto',
            stream: 'readable-stream',
            buffer: '@craftzdog/react-native-buffer',
            fs: 'expo-fs',
            path: 'path-browserify',
          },
        },
      ],
    ],
  };
};
