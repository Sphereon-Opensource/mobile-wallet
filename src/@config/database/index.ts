import {
  DataStoreContactEntities,
  DataStoreDigitalCredentialEntities,
  DataStoreEventLoggerEntities,
  DataStoreIssuanceBrandingEntities,
  DataStoreMachineStateEntities,
  DataStoreMigrations,
} from '@sphereon/ssi-sdk.data-store'
import {Entities as VeramoDataStoreEntities, migrations as VeramoDataStoreMigrations} from '@veramo/data-store'
// @ts-ignore
import {enableSimpleNullHandling, typeORMDriver} from 'react-native-nitro-sqlite'
// @ts-ignore
import {ReactNativeConnectionOptions} from 'typeorm/driver/react-native/ReactNativeConnectionOptions'
import {AddFunkeContact1724156944125} from '../../migrations/AddFunkeContact'
import {AddTrustAnchorContacts1730209599556} from '../../migrations/AddTrustAnchorContacts'
import {AddEduIdContact1774997600000} from '../../migrations/AddEduIdContact'
import {TrustAnchorEntity} from '../../entities/TrustAnchorEntity'
import {TrustAnchorContactLinkEntity} from '../../entities/TrustAnchorContactLinkEntity'
import {AddTrustAnchorTable1748880100000} from '../../migrations/AddTrustAnchorTable'
import {AddTrustAnchorContactLinkTable1748880300000} from '../../migrations/AddTrustAnchorContactLinkTable'

// Enable simple null handling for NitroSQLite to return actual null values
// instead of { isNitroSQLiteNull: true } objects. This is required for TypeORM
// compatibility, especially during migrations when reading PRAGMA table_xinfo.
enableSimpleNullHandling(true)

const DB_CONNECTION_NAME = 'default';

const sqliteConfig: ReactNativeConnectionOptions = {
  type: 'react-native',
  database: 'wallet_0_5_0.sqlite',
  location: '.',
  driver: typeORMDriver,
  entities: [
    ...VeramoDataStoreEntities,
    ...DataStoreContactEntities,
    ...DataStoreIssuanceBrandingEntities,
    ...DataStoreMachineStateEntities,
    ...DataStoreDigitalCredentialEntities,
    ...DataStoreEventLoggerEntities,
    TrustAnchorEntity,
    TrustAnchorContactLinkEntity,
  ],
  migrations: [...VeramoDataStoreMigrations, ...DataStoreMigrations, AddFunkeContact1724156944125, AddTrustAnchorContacts1730209599556, AddEduIdContact1774997600000, AddTrustAnchorTable1748880100000, AddTrustAnchorContactLinkTable1748880300000],
  migrationsRun: false, // We run migrations from code to ensure proper ordering with Redux
  synchronize: false, // We do not enable synchronize, as we use migrations from code
  migrationsTransactionMode: 'each', // protect every migration with a separate transaction
  logging: ['info', 'warn'],
  logger: 'advanced-console',
  relationLoadStrategy: 'query',
};

export {sqliteConfig, DB_CONNECTION_NAME};
