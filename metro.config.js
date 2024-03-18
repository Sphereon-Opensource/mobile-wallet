// Learn more https://docs.expo.io/guides/customizing-metro
const {getDefaultConfig} = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');
config.transformer = {
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
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
};

config.resolver = {
  resolveRequest: MetroSymlinksResolver(),
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg', 'cjs', 'json'],
  extraNodeModules: {
    stream: require.resolve('readable-stream'),
    crypto: require.resolve('@sphereon/isomorphic-webcrypto'),
  },
};

module.exports = config;
