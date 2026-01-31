module.exports = function (api) {
  api.cache(false);
  return {
    presets: ['babel-preset-expo'],

    // exclude: ['@babel/plugin-proposal-dynamic-import'],
    plugins: [
      // '@babel/plugin-syntax-dynamic-import',
      // '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-syntax-import-assertions',
      ['module:react-native-dotenv', {moduleName: 'react-native-dotenv'}],
      'babel-plugin-transform-typescript-metadata',
      ['@babel/plugin-proposal-decorators', {legacy: true}],
      ['@babel/plugin-proposal-class-properties', {loose: true}],
      '@babel/plugin-transform-class-static-block',
      [
        'module-resolver',
        {
          alias: {
            'react-native-sqlite-storage': 'react-native-nitro-sqlite',
            crypto: 'react-native-quick-crypto',
            stream: 'readable-stream',
            buffer: '@craftzdog/react-native-buffer',
            'node:events': 'events',
            'node:string_decoder': 'string_decoder',
            'node:url': 'url',
            'typeorm': 'typeorm/browser',
            'node:fs': 'expo-fs',
            fs: 'expo-fs',
            path: 'path-browserify',
          },
        },
      ],
    ],
  };
};
