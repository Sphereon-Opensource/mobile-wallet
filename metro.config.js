// Learn more https://docs.expo.io/guides/customizing-metro
const {getDefaultConfig} = require('expo/metro-config');
const {mergeConfig} = require('metro-config');
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts;
const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts;

const defaultConfig = getDefaultConfig(__dirname);
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');

/** @type {import('expo/metro-config').MetroConfig} */
const config = {
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
        includeSources: false,
      },
      toplevel: false,
      compress: {
        reduce_funcs: false,
      },
    },
  },
  resolver: {
    resolveRequest: MetroSymlinksResolver(),
    assetExts: defaultAssetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultSourceExts, 'svg', 'cjs', 'json'],
    extraNodeModules: {
      stream: require.resolve('readable-stream'),
      crypto: require.resolve('@sphereon/isomorphic-webcrypto'),
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
