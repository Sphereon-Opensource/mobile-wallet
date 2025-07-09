// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const {getDefaultConfig} = require('expo/metro-config');
const {mergeConfig} = require('metro-config');
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts;
const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts;

const defaultConfig = getDefaultConfig(__dirname);

/** @type {import('expo/metro-config').MetroConfig} */
const config = {
  resetCache: true,
  transformer: {
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    minifierConfig: {
      keep_classnames: true, // enable to fix typeorm
      keep_fnames: true, // enable to fix typeorm
      mangle: {
        toplevel: false,
        keep_classnames: true, // enable to fix typeorm
        keep_fnames: true, // enable to fix typeorm
      },
      output: {
        ascii_only: true,
        quote_style: 3,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: true,
      },
      toplevel: false,
      compress: {
        reduce_funcs: false,
      },
    },
  },
  resolver: {
    assetExts: defaultAssetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultSourceExts, 'svg', 'mjs', 'cjs', 'json'],
    extraNodeModules: {
      // shim: path.resolve(__dirname, 'shim.js'),
      // 'react-native-quick-crypto': require.resolve('@sphereon/react-native-quick-crypto'),
      // resolverMainFields: ["react-native", "browser", "module", "main"],
      typeorm: path.resolve(__dirname, "node_modules/typeorm/browser"),
      // 'react-native-sqlite-storage': require.resolve('react-native-quick-sqlite/src/index.js'),
      buffer: require.resolve('@craftzdog/react-native-buffer'),
      stream: require.resolve('readable-stream'),
      'node:crypto': require.resolve('react-native-crypto'),
      crypto: require.resolve('react-native-crypto'), // require.resolve('@sphereon/react-native-quick-crypto'),
      'node:url': require.resolve('url/'),
      url: require.resolve('url/'),
      'node:fs': require.resolve('expo-fs'),
      fs: require.resolve('expo-fs'),
      'node:path': require.resolve('path-browserify'),
      path: require.resolve('path-browserify'),
      'node:events': require.resolve('events'),
      'node:stream': require.resolve('stream-browserify'),
      'node:string_decoder': require.resolve('string_decoder'),

    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
