const {getDefaultConfig} = require('@expo/metro-config');
const {mergeConfig} = require('@react-native/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');

const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import("metro-config").MetroConfig}
 */
const svgCnfig = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import("metro-config").MetroConfig}
 */
const config = {
  transformer: {
    /*getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),*/
    // babelTransformerPath: require.resolve('react-native-svg-transformer'),
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
  /*resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg', 'cjs', 'json'],
    extraNodeModules: {
      stream: require.resolve('readable-stream'),
      crypto: require.resolve('@sphereon/isomorphic-webcrypto'),
    },
  },*/
};

defaultConfig.resolver.transform = {
  ...defaultConfig.resolver.transform,
  nonInlinedRequires: ['@react-native-async-storage/async-storage', 'React', 'react', 'react-native'],
};

defaultConfig.resolver.resolveRequest = MetroSymlinksResolver();
defaultConfig.resolver.sourceExts.push('svg', 'cjs', 'json');
defaultConfig.resolver.extraNodeModules.stream = require.resolve('readable-stream');
defaultConfig.resolver.extraNodeModules.crypto = require.resolve('@sphereon/isomorphic-webcrypto');

module.exports = mergeConfig(defaultConfig, config, svgCnfig);
