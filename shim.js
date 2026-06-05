import 'cross-fetch/polyfill';
import {DEBUG} from 'react-native-dotenv';
import {install as installCrypto} from 'react-native-quick-crypto';
import {p256} from '@noble/curves/p256';
import {p384} from '@noble/curves/p384';
import {p521} from '@noble/curves/p521';

// react-native-quick-base64@2.2.2's fromByteArray()/toByteArray() delegate to the native
// global.base64FromArrayBuffer / global.base64ToArrayBuffer (installed by its JSI module).
// react-native-quick-crypto@1.1.5's install() (written for quick-base64 v3, which we can't use on
// the Old Architecture) OVERWRITES those globals with JS wrappers that call fromByteArray() ->
// infinite recursion (RangeError: Maximum call stack size exceeded) on any Buffer.toString('base64').
// Capture the native implementations and restore them after install() to break the cycle.
const __nativeBase64FromArrayBuffer = global.base64FromArrayBuffer;
const __nativeBase64ToArrayBuffer = global.base64ToArrayBuffer;
installCrypto();
if (typeof __nativeBase64FromArrayBuffer === 'function') {
  global.base64FromArrayBuffer = __nativeBase64FromArrayBuffer;
}
if (typeof __nativeBase64ToArrayBuffer === 'function') {
  global.base64ToArrayBuffer = __nativeBase64ToArrayBuffer;
}

// Polyfill subtle.verify for ECDSA on Android
// react-native-quick-crypto passes P1363 (raw r||s) signatures directly to OpenSSL,
// but OpenSSL expects DER-encoded ASN.1 signatures, causing verification failures.
// iOS uses CommonCrypto which handles P1363 natively, so this is Android-only.
// See: HybridEcKeyPair.cpp verify() → EVP_DigestVerifyFinal expects DER
if (global.crypto && global.crypto.subtle) {
  const {Platform} = require('react-native');
  if (Platform.OS === 'android') {
    const originalVerify = global.crypto.subtle.verify.bind(global.crypto.subtle);

    // Convert IEEE P1363 signature (r||s) to DER-encoded ASN.1 signature
    function p1363ToDer(p1363Bytes, curveByteLength) {
      const r = p1363Bytes.slice(0, curveByteLength);
      const s = p1363Bytes.slice(curveByteLength, curveByteLength * 2);

      function intToDer(intBytes) {
        // Strip leading zeros but keep one if high bit is set
        let start = 0;
        while (start < intBytes.length - 1 && intBytes[start] === 0) {
          start++;
        }
        const trimmed = intBytes.slice(start);
        // Prepend 0x00 if high bit set (positive integer in ASN.1)
        const needsPadding = trimmed[0] & 0x80;
        const len = trimmed.length + (needsPadding ? 1 : 0);
        const der = new Uint8Array(2 + len);
        der[0] = 0x02; // INTEGER tag
        der[1] = len;
        if (needsPadding) {
          der[2] = 0x00;
          der.set(trimmed, 3);
        } else {
          der.set(trimmed, 2);
        }
        return der;
      }

      const rDer = intToDer(r);
      const sDer = intToDer(s);

      const seqLen = rDer.length + sDer.length;
      let header;
      if (seqLen < 128) {
        header = new Uint8Array([0x30, seqLen]);
      } else {
        header = new Uint8Array([0x30, 0x81, seqLen]);
      }

      const result = new Uint8Array(header.length + seqLen);
      result.set(header, 0);
      result.set(rDer, header.length);
      result.set(sDer, header.length + rDer.length);
      return result;
    }

    const ecdsaCurveSizes = {
      'P-256': 32,
      'P-384': 48,
      'P-521': 66,
    };

    global.crypto.subtle.verify = async function (algorithm, key, signature, data) {
      const alg = typeof algorithm === 'string' ? {name: algorithm} : algorithm;
      if (alg.name === 'ECDSA' && key.algorithm && key.algorithm.namedCurve) {
        const curveByteLength = ecdsaCurveSizes[key.algorithm.namedCurve];
        if (curveByteLength) {
          const sigBytes = new Uint8Array(signature instanceof ArrayBuffer ? signature : signature.buffer.slice(signature.byteOffset, signature.byteOffset + signature.byteLength));
          // Only convert if signature length matches P1363 format (2 * curveByteLength)
          if (sigBytes.length === curveByteLength * 2) {
            const derSig = p1363ToDer(sigBytes, curveByteLength);
            return originalVerify(algorithm, key, derSig.buffer, data);
          }
        }
      }
      return originalVerify(algorithm, key, signature, data);
    };
  }
}

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

