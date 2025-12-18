const {withDangerousMod} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withSphereonWalletPods = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(file, 'utf8');

      // Add Musap and YubiKit if not present
      if (!contents.includes("pod 'musap-ios'")) {
        const podLines = `
  pod 'musap-ios', :path => '../node_modules/@sphereon/musap-native'
  pod 'musap-react-native', :path => '../node_modules/@sphereon/musap-react-native'
  pod 'YubiKit', :modular_headers => true
`;
        // Insert after use_native_modules!
        contents = contents.replace(/use_native_modules!/, `use_native_modules!${podLines}`);
      }

      fs.writeFileSync(file, contents, 'utf8');
      return config;
    },
  ]);
};

module.exports = withSphereonWalletPods;
