import {DatabaseType, MigrationInterface, QueryRunner} from 'typeorm';
import Debug from 'debug';
import {AddTrustAnchorContactLinkTable1748880200000} from './1748880200000-AddTrustAnchorContactLinkTable';

const debug: Debug.Debugger = Debug('sphereon:ssi-sdk:migrations');

export class AddTrustAnchorContactLinkTable1748880300000 implements MigrationInterface {
  name = 'AddTrustAnchorContactLinkTable1748880300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    debug('migration: creating TrustAnchorContactLink table');
    const dbType: DatabaseType = queryRunner.connection.driver.options.type;

    switch (dbType) {
      case 'sqlite':
      case 'expo':
      case 'react-native': {
        debug('using sqlite/react-native migration file');
        const mig: AddTrustAnchorContactLinkTable1748880200000 = new AddTrustAnchorContactLinkTable1748880200000();
        await mig.up(queryRunner);
        debug('Migration statements executed');
        return;
      }
      default:
        return Promise.reject(
          `Migrations are currently only supported for sqlite, react-native, expo and postgres. Was ${dbType}. Please run your database without migrations and with 'migrationsRun: false' and 'synchronize: true' for now`,
        );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    debug('migration: dropping TrustAnchorContactLink table');
    const dbType: DatabaseType = queryRunner.connection.driver.options.type;

    switch (dbType) {
      case 'sqlite':
      case 'expo':
      case 'react-native': {
        debug('using sqlite/react-native migration file');
        const mig: AddTrustAnchorContactLinkTable1748880200000 = new AddTrustAnchorContactLinkTable1748880200000();
        await mig.down(queryRunner);
        debug('Migration statements executed');
        return;
      }
      default:
        return Promise.reject(
          `Migrations are currently only supported for sqlite, react-native, expo and postgres. Was ${dbType}. Please run your database without migrations and with 'migrationsRun: false' and 'synchronize: true' for now`,
        );
    }
  }
}
