const {getDefaultConfig} = require('expo/metro-config')
const MetroSymlinksResolver = require("@rnx-kit/metro-resolver-symlinks")

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig(__dirname)
  return {
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true
            }
        }),
        babelTransformerPath: require.resolve('react-native-svg-transformer')
    },
    resolver: {
        resolveRequest: MetroSymlinksResolver(),
        assetExts: assetExts.filter((ext) => ext !== 'svg'),
        sourceExts: [...sourceExts, 'svg', 'cjs', 'json'],
        extraNodeModules: {
            stream: require.resolve('readable-stream'),
            crypto: require.resolve('@sphereon/isomorphic-webcrypto')
        }
    }
  }
})()
