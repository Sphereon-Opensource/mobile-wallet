const {withAppBuildGradle} = require('@expo/config-plugins');

module.exports = function withAndroidStrategiesPlugin(config) {
  return withAppBuildGradle(config, config => {
    // Used to lookup the correct position
    const targetSdkVersionLine = 'targetSdkVersion rootProject.ext.targetSdkVersion';
    // The actual change
    const manifestPlaceholders = 'manifestPlaceholders = [appAuthRedirectScheme: "com.sphereon.ssi.wallet"]';

    // Check if the manifestPlaceholders already exist
    if (!config.modResults.contents.includes(manifestPlaceholders)) {
      config.modResults.contents = config.modResults.contents.replace(
        targetSdkVersionLine,
        `${targetSdkVersionLine}\n        ${manifestPlaceholders}`,
      );
    }

    return config;
  });
};
