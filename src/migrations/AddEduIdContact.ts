import {DatabaseType, MigrationInterface, QueryRunner} from 'typeorm';
import Debug from 'debug';
import {AddEduIdContact1774997500000} from './1774997500000-AddEduIdContact';

const debug: Debug.Debugger = Debug('sphereon:ssi-sdk:migrations');

export class AddEduIdContact1774997600000 implements MigrationInterface {
  name = 'AddEduIdContact1774997600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    debug('migration: creating eduID contact');
    const dbType: DatabaseType = queryRunner.connection.driver.options.type;

    switch (dbType) {
      case 'sqlite':
      case 'expo':
      case 'react-native': {
        debug('using sqlite/react-native migration file');
        const mig: AddEduIdContact1774997500000 = new AddEduIdContact1774997500000();
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
    debug('migration: reverting eduID contact');
    const dbType: DatabaseType = queryRunner.connection.driver.options.type;

    switch (dbType) {
      case 'sqlite':
      case 'expo':
      case 'react-native': {
        debug('using sqlite/react-native migration file');
        const mig: AddEduIdContact1774997500000 = new AddEduIdContact1774997500000();
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
