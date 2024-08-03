const deeplinkSchemes = [
  'com.sphereon.ssi.wallet',
  'openid',
  'openid-initiate-issuance', // old, should be removed soon
  'openid-credential-offer',
  'openid-vc',
  'openid4vp',
];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {version: appVersion} = require('./package.json');

/**
 * @type {import("@expo/config-types").ExpoConfig}
 */
const config = {
  // owner: 'Sphereon International B.V.',
  name: 'Sphereon Wallet',
  slug: 'SphereonWallet',
  version: appVersion,
  orientation: 'portrait',
  updates: {
    fallbackToCacheTimeout: 0,
  },
  jsEngine: 'hermes',
  androidNavigationBar: {
    barStyle: 'light-content',
    backgroundColor: '#202537',
  },
  icon: './assets/images/icon.png',
  splash: {
    image: './assets/images/splashscreen_image.png',
    backgroundColor: '#202537',
  },
  extra: {
    eas: {
      projectId: '76b1c6a4-d1d8-421e-8514-ee9db0b197b4',
    },
  },

  plugins: [
    'expo-localization',
    './plugin/appAuthPluginAndroid.js',
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Poppins-Black.ttf',
          './assets/fonts/Poppins-BlackItalic.ttf',
          './assets/fonts/Poppins-Bold.ttf',
          './assets/fonts/Poppins-BoldItalic.ttf',
          './assets/fonts/Poppins-ExtraBold.ttf',
          './assets/fonts/Poppins-ExtraBoldItalic.ttf',
          './assets/fonts/Poppins-ExtraLight.ttf',
          './assets/fonts/Poppins-ExtraLightItalic.ttf',
          './assets/fonts/Poppins-Italic.ttf',
          './assets/fonts/Poppins-Light.ttf',
          './assets/fonts/Poppins-LightItalic.ttf',
          './assets/fonts/Poppins-Medium.ttf',
          './assets/fonts/Poppins-MediumItalic.ttf',
          './assets/fonts/Poppins-Regular.ttf',
          './assets/fonts/Poppins-SemiBold.ttf',
          './assets/fonts/Poppins-SemiBoldItalic.ttf',
          './assets/fonts/Poppins-Thin.ttf',
          './assets/fonts/Poppins-ThinItalic.ttf',
        ],
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          minSdkVersion: 28,
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
          useLegacyPackaging: true,
        },
      },
    ],
  ],
  android: {
    package: 'com.sphereon.ssi.wallet',
    useLegacyPackaging: true,
    intentFilters: [
      ...deeplinkSchemes.map(scheme => ({
        action: 'VIEW',
        category: ['DEFAULT', 'BROWSABLE'],
        data: {
          scheme,
        },
      })),
    ],
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.sphereon.ssi.wallet',
  },
};

export default config;
