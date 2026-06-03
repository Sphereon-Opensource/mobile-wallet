// Mock for react-native-quick-crypto — replaces native crypto with Node's built-in
const nodeCrypto = require('crypto');

module.exports = {
  ...nodeCrypto,
  default: nodeCrypto,
};
