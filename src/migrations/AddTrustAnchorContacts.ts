import {DatabaseType, MigrationInterface, QueryRunner} from 'typeorm';
import Debug from 'debug';
import {AddTrustAnchorContacts1730209432321} from './1730209432321-AddTrustAnchorContacts';

const debug: Debug.Debugger = Debug('sphereon:ssi-sdk:migrations');

export class AddTrustAnchorContacts1730209599556 implements MigrationInterface {
  name = 'AddTrustAnchorContacts1730209599556';

  public async up(queryRunner: QueryRunner): Promise<void> {
    debug('migration: creating machine state tables');
    const dbType: DatabaseType = queryRunner.connection.driver.options.type;

    switch (dbType) {
      case 'sqlite':
      case 'expo':
      case 'react-native': {
        debug('using sqlite/react-native migration file');
        const mig: AddTrustAnchorContacts1730209432321 = new AddTrustAnchorContacts1730209432321();
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
        const mig: AddTrustAnchorContacts1730209432321 = new AddTrustAnchorContacts1730209432321();
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
