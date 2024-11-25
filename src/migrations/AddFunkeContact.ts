import {DatabaseType, MigrationInterface, QueryRunner} from 'typeorm';
import Debug from 'debug';
import {AddFunkeContact1724151222549} from './1724151222549-AddFunkeContact';

const debug: Debug.Debugger = Debug('sphereon:ssi-sdk:migrations');

export class AddFunkeContact1724156944125 implements MigrationInterface {
  name = 'AddFunkeContact1724156944126';

  public async up(queryRunner: QueryRunner): Promise<void> {
    debug('migration: creating machine state tables');
    const dbType: DatabaseType = queryRunner.connection.driver.options.type;

    switch (dbType) {
      case 'sqlite':
      case 'expo':
      case 'react-native': {
        debug('using sqlite/react-native migration file');
        const mig: AddFunkeContact1724151222549 = new AddFunkeContact1724151222549();
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
    debug('migration: reverting machine state tables');
    const dbType: DatabaseType = queryRunner.connection.driver.options.type;

    switch (dbType) {
      case 'sqlite':
      case 'expo':
      case 'react-native': {
        debug('using sqlite/react-native migration file');
        const mig: AddFunkeContact1724151222549 = new AddFunkeContact1724151222549();
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
