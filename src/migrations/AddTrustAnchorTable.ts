import {DatabaseType, MigrationInterface, QueryRunner} from 'typeorm';
import Debug from 'debug';
import {AddTrustAnchorTable1748880000000} from './1748880000000-AddTrustAnchorTable';

const debug: Debug.Debugger = Debug('sphereon:ssi-sdk:migrations');

export class AddTrustAnchorTable1748880100000 implements MigrationInterface {
  name = 'AddTrustAnchorTable1748880100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    debug('migration: creating TrustAnchor table');
    const dbType: DatabaseType = queryRunner.connection.driver.options.type;

    switch (dbType) {
      case 'sqlite':
      case 'expo':
      case 'react-native': {
        debug('using sqlite/react-native migration file');
        const mig: AddTrustAnchorTable1748880000000 = new AddTrustAnchorTable1748880000000();
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
    debug('migration: dropping TrustAnchor table');
    const dbType: DatabaseType = queryRunner.connection.driver.options.type;

    switch (dbType) {
      case 'sqlite':
      case 'expo':
      case 'react-native': {
        debug('using sqlite/react-native migration file');
        const mig: AddTrustAnchorTable1748880000000 = new AddTrustAnchorTable1748880000000();
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
