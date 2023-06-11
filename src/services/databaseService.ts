import Debug from 'debug';
import {DataSource} from 'typeorm';

import {APP_ID} from '../@config/constants';
import {sqliteConfig} from '../@config/database';

const debug: Debug.Debugger = Debug(`${APP_ID}:databaseService`);

/**
 * Todo, move to a class
 */
const dataSources = new Map();

export const getDbConnection = async (dbName: string): Promise<DataSource> => {
  if (sqliteConfig.synchronize) {
    return Promise.reject(
      `WARNING: Migrations need to be enabled in this app! Adjust the database configuration and set migrationsRun and synchronize to false`,
    );
  }

  if (dataSources.has(dbName)) {
    return dataSources.get(dbName);
  }

  const dataSource = await new DataSource({...sqliteConfig, name: dbName}).initialize();
  dataSources.set(dbName, dataSource);
  if (sqliteConfig.migrationsRun) {
    debug(
      `Migrations are currently managed from config. Please set migrationsRun and synchronize to false to get consistent behaviour. We run migrations from code explicitly`,
    );
  } else {
    debug(`Running ${dataSource.migrations.length} migration(s) from code if needed...`);
    await dataSource.runMigrations();
    debug(`${dataSource.migrations.length} migration(s) from code were inspected and applied`);
  }

  return dataSource;
};

export const dropDatabase = async (dbName: string): Promise<void> => {
  if (!dataSources.has(dbName)) {
    return Promise.reject(Error(`No database present with name: ${dbName}`));
  }

  const connection: DataSource = await getDbConnection(dbName);
  await connection.dropDatabase();
  dataSources.delete(dbName);
};

export const resetDatabase = async (dbName: string): Promise<void> => {
  await dropDatabase(dbName);
  await getDbConnection(dbName);
};
