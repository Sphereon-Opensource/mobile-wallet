import {
  DataStoreContactEntities,
  DataStoreIssuanceBrandingEntities,
  DataStoreMachineStateEntities,
  DataStoreMigrations,
} from '@sphereon/ssi-sdk.data-store';
import {Entities as VeramoDataStoreEntities, migrations as VeramoDataStoreMigrations} from '@veramo/data-store';
import * as driver from 'expo-sqlite';
import {ExpoConnectionOptions} from 'typeorm/driver/expo/ExpoConnectionOptions';

const DB_CONNECTION_NAME = 'default';
const DB_ENCRYPTION_KEY = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c';

const sqliteConfig: ExpoConnectionOptions = {
  type: 'expo',
  database: 'sphereon-wallet.sqlite',
  driver,
  entities: [...VeramoDataStoreEntities, ...DataStoreContactEntities, ...DataStoreIssuanceBrandingEntities, ...DataStoreMachineStateEntities],
  migrations: [...VeramoDataStoreMigrations, ...DataStoreMigrations],
  migrationsRun: false, // We run migrations from code to ensure proper ordering with Redux
  synchronize: false, // We do not enable synchronize, as we use migrations from code
  migrationsTransactionMode: 'each', // protect every migration with a separate transaction
  logging: ['info', 'warn'],
  logger: 'advanced-console',
};

export {sqliteConfig, DB_CONNECTION_NAME, DB_ENCRYPTION_KEY};
