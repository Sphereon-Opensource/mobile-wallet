module.exports = {
  getRandomBytesAsync: jest.fn((byteCount) => {
    const uint8Array = new Uint8Array(byteCount);
    for (let i = 0; i < byteCount; i++) {
      uint8Array[i] = Math.floor(Math.random() * 256);
    }
    return Promise.resolve(uint8Array);
  }),
};
