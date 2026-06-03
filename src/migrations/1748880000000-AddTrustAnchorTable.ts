import {MigrationInterface, QueryRunner, Table} from 'typeorm';

export class AddTrustAnchorTable1748880000000 implements MigrationInterface {
  name = 'AddTrustAnchorTable1748880000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'TrustAnchor',
        columns: [
          {name: 'id', type: 'varchar', isPrimary: true},
          {name: 'type', type: 'varchar'},
          {name: 'label', type: 'varchar'},
          {name: 'value', type: 'text'},
          {name: 'trustMode', type: 'varchar'},
          {name: 'subjectDN', type: 'varchar', isNullable: true},
          {name: 'issuerDN', type: 'varchar', isNullable: true},
          {name: 'notBefore', type: 'datetime', isNullable: true},
          {name: 'notAfter', type: 'datetime', isNullable: true},
          {name: 'fingerprintSha256', type: 'varchar', isNullable: true},
          {name: 'source', type: 'varchar'},
          {name: 'createdAt', type: 'datetime', default: "datetime('now')"},
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('TrustAnchor');
  }
}
