import 'reflect-metadata'; // needed for typeorm migrations
import {install as installCrypto} from 'react-native-quick-crypto';

installCrypto();
global.crypto['aa__THISONE'] = true; // FIXME DELETE
if (!global.window.crypto) {
  global.window.crypto = global.crypto;
}
if (typeof self !== 'undefined') {
  self.crypto = global.crypto;
}

export const walletCrypto = global.crypto;
global.CryptoKey = walletCrypto.CryptoKey; // FIXME DELETE?
global.window.CryptoKey = walletCrypto.CryptoKey; // FIXME DELETE?
console.log('global.crypto.subtle', global.crypto.webcrypto.subtle); // FIXME DELETE
console.log('global.crypto.webcrypto.subtle', global.crypto.webcrypto.subtle); // FIXME DELETE

import './shim';
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
