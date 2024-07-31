import {DataSources} from '@sphereon/ssi-sdk.agent-config';
import {OrPromise} from '@veramo/utils';
import {DataSource} from 'typeorm';
import {DB_CONNECTION_NAME, sqliteConfig} from '../@config/database';

export const getDbConnection = async (dbName: string): Promise<DataSource> => {
  if (!DataSources.singleInstance().has(dbName)) {
    DataSources.singleInstance().addConfig(dbName, sqliteConfig);
  }
  return DataSources.singleInstance().getDbConnection(dbName);
};

export const DEFAULT_DB_CONNECTION = getDbConnection(DB_CONNECTION_NAME) as OrPromise<DataSource>;
