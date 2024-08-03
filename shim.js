import {DEBUG} from '@env';

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

// If using the crypto shim, uncomment the following line to ensure
// crypto is loaded first, so it can populate global.crypto
// require('crypto')
