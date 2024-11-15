import {decode} from 'base-64';

export default class WavPacker {
  // Converts Float32Array audio data to WAV ArrayBuffer in Int16 format
  static float32ToWav(float32Array: Float32Array, sampleRate = 24000, numChannels = 1) {
    const bufferLength = float32Array.length * 2 + 44; // Header + PCM data
    const buffer = new ArrayBuffer(bufferLength);
    const view = new DataView(buffer);

    // Write WAV header
    this.writeWavHeader(view, float32Array.length, sampleRate, numChannels);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, float32Array[i])); // clamp value
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true); // little-endian
    }

    return buffer;
  }

  static int16ToWav(int16Array: Int16Array, sampleRate = 24000, numChannels = 1) {
    const bufferLength = int16Array.length * 2 + 44; // Header + PCM data
    const buffer = new ArrayBuffer(bufferLength);
    const view = new DataView(buffer);

    // Write WAV header
    this.writeWavHeader(view, int16Array.length, sampleRate, numChannels);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < int16Array.length; i++, offset += 2) {
      view.setInt16(offset, int16Array[i], true); // little-endian
    }

    return buffer;
  }

  // Helper function to write WAV file headers
  static writeWavHeader(view: DataView, dataLength: number, sampleRate: number, numChannels: number) {
    const blockAlign = numChannels * 2;
    const byteRate = sampleRate * blockAlign;
    const fileLength = dataLength * blockAlign + 44 - 8;

    // RIFF identifier
    view.setUint32(0, 0x46464952, false); // "RIFF"
    view.setUint32(4, fileLength, true);
    view.setUint32(8, 0x45564157, false); // "WAVE"
    view.setUint32(12, 0x20746d66, false); // "fmt " chunk
    view.setUint32(16, 16, true); // PCM format chunk size
    view.setUint16(20, 1, true); // Audio format (1 = PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // Bits per sample
    view.setUint32(36, 0x61746164, false); // "data" chunk
    view.setUint32(40, dataLength * blockAlign, true);
  }

  static createWavBlob(
    data: Float32Array, // PCM audio data as Float32Array
    sampleRate: number,
    channels: Float32Array[], // Array representing audio channels
    bitsPerSample: number = 32, // Set to 32 for Float32 PCM
  ): Blob {
    // Helper function to pack data into a buffer in little-endian format
    function packData(value: number, bytes: number): Uint8Array {
      const buffer = new ArrayBuffer(bytes);
      const view = new DataView(buffer);
      if (bytes === 4) {
        view.setUint32(0, value, true); // 32-bit value in little-endian
      } else if (bytes === 2) {
        view.setUint16(0, value, true); // 16-bit value in little-endian
      }
      return new Uint8Array(buffer);
    }

    // Update audio format code for Float32 PCM
    const audioFormat = bitsPerSample === 32 ? 3 : 1; // 3 = IEEE float, 1 = PCM (int16)

    // Build the WAV header
    const header = [
      // "RIFF" chunk descriptor
      new TextEncoder().encode('RIFF'),
      packData(36 + (data.length * channels.length * bitsPerSample) / 8, 4), // Chunk size
      new TextEncoder().encode('WAVE'),

      // "fmt " sub-chunk
      new TextEncoder().encode('fmt '),
      packData(16, 4), // Subchunk1Size for PCM
      packData(audioFormat, 2), // Audio format (3 for IEEE float, 1 for PCM int16)
      packData(channels.length, 2), // Number of channels
      packData(sampleRate, 4), // Sample rate
      packData((sampleRate * channels.length * bitsPerSample) / 8, 4), // Byte rate
      packData((channels.length * bitsPerSample) / 8, 2), // Block align
      packData(bitsPerSample, 2), // Bits per sample

      // "data" sub-chunk
      new TextEncoder().encode('data'),
      packData((data.length * channels.length * bitsPerSample) / 8, 4), // Subchunk2Size
    ];

    // Concatenate header and PCM data into a single Blob
    const blobParts = [...header, new Uint8Array(data.buffer)];
    const blob = new Blob(blobParts, {type: 'audio/wav'});

    return blob;
  }

  static base64ToInt16Array(base64: string): Int16Array {
    // Decode the Base64 string into a Uint8Array
    const binaryString = decode(base64);
    const wavData = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      wavData[i] = binaryString.charCodeAt(i);
    }

    return new Int16Array(wavData.buffer, 0, wavData.length / 2); // 2 bytes per sample for Int16
  }

  static createWavBase64(
    data: Int16Array, // PCM audio data as Int16Array
    sampleRate: number,
    channels: Int16Array[], // Array representing audio channels
    bitsPerSample: number = 16, // Set to 16 for Int16 PCM data
  ): string {
    // Helper function to pack data into a buffer in little-endian format
    function packData(value: number, bytes: number): Uint8Array {
      const buffer = new ArrayBuffer(bytes);
      const view = new DataView(buffer);
      if (bytes === 4) {
        view.setUint32(0, value, true); // 32-bit value in little-endian
      } else if (bytes === 2) {
        view.setUint16(0, value, true); // 16-bit value in little-endian
      }
      return new Uint8Array(buffer);
    }

    // Set audio format for 16-bit PCM
    const audioFormat = 1; // 1 = PCM (for Int16 data)

    // Calculate the WAV header
    const headerParts = [
      // "RIFF" chunk descriptor
      new TextEncoder().encode('RIFF'),
      packData(36 + (data.length * channels.length * bitsPerSample) / 8, 4), // Chunk size
      new TextEncoder().encode('WAVE'),

      // "fmt " sub-chunk
      new TextEncoder().encode('fmt '),
      packData(16, 4), // Subchunk1Size for PCM
      packData(audioFormat, 2), // Audio format (1 for PCM Int16)
      packData(channels.length, 2), // Number of channels
      packData(sampleRate, 4), // Sample rate
      packData((sampleRate * channels.length * bitsPerSample) / 8, 4), // Byte rate
      packData((channels.length * bitsPerSample) / 8, 2), // Block align
      packData(bitsPerSample, 2), // Bits per sample

      // "data" sub-chunk
      new TextEncoder().encode('data'),
      packData((data.length * channels.length * bitsPerSample) / 8, 4), // Subchunk2Size
    ];

    // Flatten the header arrays by calculating the total length first
    const headerLength = headerParts.reduce((sum, part) => sum + part.length, 0);
    const headerData = new Uint8Array(headerLength);
    let offset = 0;
    headerParts.forEach(part => {
      headerData.set(part, offset);
      offset += part.length;
    });

    // Convert PCM Int16Array data to Uint8Array
    const pcmData = new Uint8Array(data.buffer);

    // Combine header and PCM data into a single array
    const wavData = new Uint8Array(headerData.length + pcmData.length);
    wavData.set(headerData, 0);
    wavData.set(pcmData, headerData.length);

    // Convert Uint8Array to a Base64 string in chunks to avoid maximum call stack issues
    let binary = '';
    const chunkSize = 8192; // Process data in chunks
    for (let i = 0; i < wavData.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, wavData.slice(i, i + chunkSize) as unknown as number[]);
    }

    const base64String = btoa(binary);

    return base64String;
  }
}
