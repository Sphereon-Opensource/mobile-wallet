import {install as installCrypto} from 'react-native-quick-crypto';
import 'reflect-metadata'; // needed for migrations

installCrypto();
if (!global.window.crypto) {
  global.window.crypto = global.crypto;
}
if (typeof self !== 'undefined') {
  self.crypto = global.crypto;
}
import './shim';
//import 'react-native-get-random-values';
import '@ethersproject/shims';
import 'fast-text-encoding';
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto'; // Applying the polyfill for URL from lib.dom
// if (typeof BigInt === 'undefined') global.BigInt = require('big-integer')
import {registerRootComponent} from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
