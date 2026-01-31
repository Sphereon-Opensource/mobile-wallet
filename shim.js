import 'cross-fetch/polyfill';
import {DEBUG} from 'react-native-dotenv';
import {install as installCrypto} from 'react-native-quick-crypto';
import {p256} from '@noble/curves/p256';
import {p384} from '@noble/curves/p384';
import {p521} from '@noble/curves/p521';

installCrypto();

// Polyfill subtle.deriveBits for ECDH (P-256, P-384, P-521)
// react-native-quick-crypto does not implement ECDH deriveBits yet
// See: https://github.com/margelo/react-native-quick-crypto/issues/647
if (global.crypto && global.crypto.subtle) {
  const originalDeriveBits = global.crypto.subtle.deriveBits.bind(global.crypto.subtle);
  const originalDeriveKey = global.crypto.subtle.deriveKey.bind(global.crypto.subtle);

  const curveMap = {
    'P-256': {curve: p256, byteLength: 32},
    'P-384': {curve: p384, byteLength: 48},
    'P-521': {curve: p521, byteLength: 66},
  };

  function base64UrlToHex(b64u) {
    const b64 = b64u.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (b64.length % 4)) % 4);
    const binary = atob(b64 + padding);
    let hex = '';
    for (let i = 0; i < binary.length; i++) {
      const byte = binary.charCodeAt(i).toString(16);
      hex += byte.length === 1 ? '0' + byte : byte;
    }
    return hex;
  }

  global.crypto.subtle.deriveBits = async function (algorithm, baseKey, length) {
    if (algorithm && algorithm.name === 'ECDH' && baseKey.algorithm && baseKey.algorithm.namedCurve) {
      const namedCurve = baseKey.algorithm.namedCurve;
      const curveInfo = curveMap[namedCurve];
      if (!curveInfo) {
        throw new Error(`ECDH deriveBits polyfill: unsupported curve ${namedCurve}`);
      }

      function forceExportJwk(key) {
        // Bypass extractable check by accessing the internal keyObject handle directly
        if (key.keyObject && key.keyObject.handle && key.keyObject.handle.exportJwk) {
          const jwk = key.keyObject.handle.exportJwk({key_ops: key.usages || [], ext: true}, true);
          if (key.algorithm && key.algorithm.namedCurve) {
            jwk.crv = jwk.crv || key.algorithm.namedCurve;
          }
          return jwk;
        }
        return global.crypto.subtle.exportKey('jwk', key);
      }

      const publicKeyJwk = await forceExportJwk(algorithm.public);
      const privateKeyJwk = await forceExportJwk(baseKey);

      const privateKeyHex = base64UrlToHex(privateKeyJwk.d);
      const publicKeyHex = '04' + base64UrlToHex(publicKeyJwk.x) + base64UrlToHex(publicKeyJwk.y);

      const sharedSecret = curveInfo.curve.getSharedSecret(privateKeyHex, publicKeyHex, false);
      // getSharedSecret returns uncompressed point (04 || x || y), we need just x coordinate
      const xBytes = sharedSecret.slice(1, 1 + curveInfo.byteLength);

      const resultLength = length ? length / 8 : curveInfo.byteLength;
      const result = xBytes.slice(0, resultLength);
      return result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
    }
    return originalDeriveBits(algorithm, baseKey, length);
  };

  global.crypto.subtle.deriveKey = async function (algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages) {
    if (algorithm && algorithm.name === 'ECDH' && baseKey.algorithm && baseKey.algorithm.namedCurve) {
      const lengthMap = {
        'A128GCM': 128,
        'A192GCM': 192,
        'A256GCM': 256,
        'A128CBC-HS256': 256,
        'A192CBC-HS384': 384,
        'A256CBC-HS512': 512,
      };
      const bitLength = derivedKeyAlgorithm.length || lengthMap[derivedKeyAlgorithm.name] || 256;
      const bits = await global.crypto.subtle.deriveBits(algorithm, baseKey, bitLength);
      return global.crypto.subtle.importKey('raw', bits, derivedKeyAlgorithm, extractable, keyUsages);
    }
    return originalDeriveKey(algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages);
  };
}
if (typeof __dirname === 'undefined') global.__dirname = '/';
if (typeof __filename === 'undefined') global.__filename = '';
if (typeof process === 'undefined') {
  global.process = require('process');
} else {
  const bProcess = require('process');
  for (const p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p];
    }
  }
}
const debug = require('debug');

process.browser = false;
// if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer;

// global.location = global.location || { port: 80 }
const isDev = typeof __DEV__ === 'boolean' && __DEV__;
// console.log(JSON.stringify(process.env));
if (typeof process.env['NODE_ENV'] !== 'string') {
  // process.env['NODE_ENV'] = isDev !== false ? 'development' : 'production';
}
const level = isDev ? DEBUG ?? '*' : '';
if (typeof window !== 'undefined') {
  // @ts-ignore
  process.type = 'renderer';
  // @ts-ignore
  window.localStorage = {
    debug: level,
    getItem: () => {
      return level;
    },
  };
}

if (isDev) {
  debug.log = console.info.bind(console);
  debug.enable(level);
}

