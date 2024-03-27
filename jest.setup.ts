import {DataStoreContactEntities, DataStoreIssuanceBrandingEntities, DataStoreMigrations} from '@sphereon/ssi-sdk.data-store';
import '@testing-library/jest-native/extend-expect';
import {Entities as VeramoDataStoreEntities} from '@veramo/data-store';
import {migrations as VeramoDataStoreMigrations} from '@veramo/data-store/build/migrations';
import {LogBox} from 'react-native';
// include this line for mocking react-native-gesture-handler
import 'react-native-gesture-handler/jestSetup';
import {DataSource} from 'typeorm';
import {SqliteConnectionOptions} from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import {TextDecoder, TextEncoder} from 'util';
import Localization from './src/localization/Localization';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);
// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
// jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('@react-navigation/native/lib/commonjs/useLinking.native', () => ({
  default: () => ({getInitialState: {then: jest.fn()}}),
  __esModule: true,
}));
jest.doMock('./src/services/databaseService', () => ({
  getDbConnection: jest.fn(() => {
    const sqliteConfig: SqliteConnectionOptions = {
      type: 'sqlite',
      database: ':memory:',
      entities: [...VeramoDataStoreEntities, ...DataStoreContactEntities, ...DataStoreIssuanceBrandingEntities],
      migrations: [...VeramoDataStoreMigrations, ...DataStoreMigrations],
      migrationsRun: true, // We run migrations from code to ensure proper ordering with Redux
      synchronize: false, // We do not enable synchronize, as we use migrations from code
      migrationsTransactionMode: 'each', // protect every migration with a separate transaction
      logging: ['warn'], // 'all' means to enable all logging
      logger: 'advanced-console',
    };

    const dataSource = new DataSource({
      ...sqliteConfig,
      name: 'test',
    }).initialize();
    return dataSource;
  }),
}));

jest.mock('react-native-share', () => ({
  default: jest.fn(),
}));
/*jest.mock('@mattrglobal/bbs-signatures', () => {
  return {
    blsSign: jest.fn(),
    generateBls12381G2KeyPair: jest.fn(),
  };
});*/

/*
const originalRNSecureKeyStore = jest.requireActual('react-native-secure-key-store');

export const ACCESSIBLE = originalRNSecureKeyStore.ACCESSIBLE;

class RNSecureKeyStoreMock {
  store;

  constructor() {
    this.store = new Map();
  }

  get(k: string) {
    const result = this.store.get(k);
    return Promise.resolve(result);
  }

  remove(k: string) {
    this.store.delete(k);
    return Promise.resolve(true);
  }

  set(k: string, value: any, opts?: {accessible?: typeof ACCESSIBLE | string}) {
    console.log('set', k, value);

    this.store.set(k, value);
    return Promise.resolve(true);
  }
}

const RNSecureKeyStore = new RNSecureKeyStoreMock();
const mockRNSecureKeyStore = RNSecureKeyStore;
const mockAccessible = ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY;
jest.mock('react-native-secure-key-store', () => ({
  ACCESSIBLE: mockAccessible,
  get: jest.fn((key: string) => mockRNSecureKeyStore.get(key)),
  set: jest.fn(
    (
      key: string,
      value: string,
      options?: {
        accessible?: typeof ACCESSIBLE;
      },
    ) => mockRNSecureKeyStore.set(key, value),
  ),
  remove: jest.fn((key: string) => mockRNSecureKeyStore.remove(key)),
}));
*/

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn((byteCount: number): Promise<Uint8Array> => {
    const uint8Array = new Uint8Array(byteCount);
    while (byteCount && byteCount--) {
      uint8Array[byteCount] = Math.floor(Math.random() * 256);
    }
    return Promise.resolve(uint8Array);
  }),
}));

jest.mock('expo-file-system', () => ({
  downloadAsync: jest.fn(() => Promise.resolve({md5: 'md5', uri: 'uri'})),
  getInfoAsync: jest.fn(() => Promise.resolve({exists: true, md5: 'md5', uri: 'uri'})),
  readAsStringAsync: jest.fn(() => Promise.resolve()),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve()),
  createDownloadResumable: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-fs', () => {
  return {
    mkdir: jest.fn(),
    moveFile: jest.fn(),
    copyFile: jest.fn(),
    pathForBundle: jest.fn(),
    pathForGroup: jest.fn(),
    getFSInfo: jest.fn(),
    getAllExternalFilesDirs: jest.fn(),
    unlink: jest.fn(),
    exists: jest.fn(),
    stopDownload: jest.fn(),
    resumeDownload: jest.fn(),
    isResumable: jest.fn(),
    stopUpload: jest.fn(),
    completeHandlerIOS: jest.fn(),
    readDir: jest.fn(),
    readDirAssets: jest.fn(),
    existsAssets: jest.fn(),
    readdir: jest.fn(),
    setReadable: jest.fn(),
    stat: jest.fn(),
    readFile: jest.fn(),
    read: jest.fn(),
    readFileAssets: jest.fn(),
    hash: jest.fn(),
    copyFileAssets: jest.fn(),
    copyFileAssetsIOS: jest.fn(),
    copyAssetsVideoIOS: jest.fn(),
    writeFile: jest.fn(),
    appendFile: jest.fn(),
    write: jest.fn(),
    downloadFile: jest.fn(),
    uploadFiles: jest.fn(),
    touch: jest.fn(),
    MainBundlePath: jest.fn(),
    CachesDirectoryPath: jest.fn(),
    DocumentDirectoryPath: jest.fn(),
    ExternalDirectoryPath: jest.fn(),
    ExternalStorageDirectoryPath: jest.fn(),
    TemporaryDirectoryPath: jest.fn(),
    LibraryDirectoryPath: jest.fn(),
    PicturesDirectoryPath: jest.fn(),
  };
});

global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

Object.assign(global, {TextDecoder, TextEncoder});

Localization.setI18nConfig();
