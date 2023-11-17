import path from 'path';
import type {JestConfigWithTsJest} from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  verbose: true,
  preset: 'jest-expo',
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleDirectories: ['node_modules', path.join(__dirname, 'src')],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|@sphereon/ui-components.ssi-react-native|expo*|react-native-*|uint8arrays|multiformats|@veramo|@sphereon|nanoid|@mattrglobal|typeorm|uuid|yaml)',
  ],
  moduleNameMapper: {
    typeorm: '<rootDir>/node_modules/typeorm',
    '\\.svg': '<rootDir>/__mocks__/svgMock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
export default jestConfig;
