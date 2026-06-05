// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const {getDefaultConfig} = require('expo/metro-config');
const {mergeConfig} = require('metro-config');

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
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg', 'mjs', 'cjs', 'json'],
    unstable_enableSymlinks: true,
    // Work around ESM-only packages that Metro cannot resolve via package.json
    // (no `main`, `exports`-map only). These are pulled in by
    // @4sure-tech/vc-bitstring-status-lists (a dep of @sphereon/ssi-sdk.vc-status-list,
    // used for W3C Bitstring Status List checks).
    resolveRequest: (context, moduleName, platform) => {
      // uint8arrays: nested v5 is ESM-only; redirect every import to the top-level CJS v3
      // (same API). This also makes the v5-only nested multiformats@13 unreachable.
      if (moduleName === 'uint8arrays' || moduleName.startsWith('uint8arrays/')) {
        const sub = moduleName === 'uint8arrays' ? 'index' : moduleName.slice('uint8arrays/'.length);
        return {
          type: 'sourceFile',
          filePath: path.resolve(__dirname, `node_modules/uint8arrays/cjs/src/${sub}.js`),
        };
      }
      // base64url-universal@2 is ESM-only with no `main` (exports: "./lib/index.js").
      // Point Metro directly at the entry file; it transforms the ESM source fine.
      if (moduleName === 'base64url-universal') {
        return {
          type: 'sourceFile',
          filePath: path.resolve(__dirname, 'node_modules/base64url-universal/lib/index.js'),
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
    extraNodeModules: {
      // shim: path.resolve(__dirname, 'shim.js'),
      // resolverMainFields: ["react-native", "browser", "module", "main"],
      typeorm: path.resolve(__dirname, "node_modules/typeorm/browser"),
      // 'react-native-sqlite-storage': require.resolve('react-native-quick-sqlite/src/index.js'),
      buffer: require.resolve('@craftzdog/react-native-buffer'),
      stream: require.resolve('readable-stream'),
      'node:crypto': require.resolve('react-native-quick-crypto'),
      crypto: require.resolve('react-native-quick-crypto'),
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
