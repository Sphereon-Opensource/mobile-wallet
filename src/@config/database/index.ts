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
import {AddFunkeContact1724156944125} from '../../migrations/AddFunkeContact';

const DB_CONNECTION_NAME = 'default';

const sqliteConfig: ReactNativeConnectionOptions = {
  type: 'react-native',
  database: 'funke-wallet-v0.4.sqlite',
  location: '.',
  driver: typeORMDriver,
  entities: [
    ...VeramoDataStoreEntities,
    ...DataStoreContactEntities,
    ...DataStoreIssuanceBrandingEntities,
    ...DataStoreMachineStateEntities,
    ...DataStoreDigitalCredentialEntities,
  ],
  migrations: [...VeramoDataStoreMigrations, ...DataStoreMigrations, AddFunkeContact1724156944125],
  migrationsRun: false, // We run migrations from code to ensure proper ordering with Redux
  synchronize: false, // We do not enable synchronize, as we use migrations from code
  migrationsTransactionMode: 'each', // protect every migration with a separate transaction
  logging: ['warn'], //['info', 'warn'],
  logger: 'advanced-console',
  relationLoadStrategy: 'query',
};

export {sqliteConfig, DB_CONNECTION_NAME};
