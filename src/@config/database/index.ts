import {
  DataStoreContactEntities,
  DataStoreDigitalCredentialEntities,
  DataStoreIssuanceBrandingEntities,
  DataStoreMachineStateEntities,
  DataStoreMigrations,
} from '@sphereon/ssi-sdk.data-store';
import {Entities as VeramoDataStoreEntities, migrations as VeramoDataStoreMigrations} from '@veramo/data-store';
// @ts-ignore
import {typeORMDriver} from 'react-native-quick-sqlite';
import {ReactNativeConnectionOptions} from 'typeorm/driver/react-native/ReactNativeConnectionOptions';

const DB_CONNECTION_NAME = 'default';
const DB_ENCRYPTION_KEY = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c';

const sqliteConfig: ReactNativeConnectionOptions = {
  type: 'react-native',
  database: 'sphereon-wallet-v0.3.sqlite',
  location: '.',
  driver: typeORMDriver,
  entities: [
    ...VeramoDataStoreEntities,
    ...DataStoreContactEntities,
    ...DataStoreIssuanceBrandingEntities,
    ...DataStoreMachineStateEntities,
    ...DataStoreDigitalCredentialEntities,
  ],
  migrations: [...VeramoDataStoreMigrations, ...DataStoreMigrations],
  migrationsRun: false, // We run migrations from code to ensure proper ordering with Redux
  synchronize: false, // We do not enable synchronize, as we use migrations from code
  migrationsTransactionMode: 'each', // protect every migration with a separate transaction
  logging: ['info', 'warn'],
  logger: 'advanced-console',
  relationLoadStrategy: 'query',
};

export {sqliteConfig, DB_CONNECTION_NAME, DB_ENCRYPTION_KEY};
