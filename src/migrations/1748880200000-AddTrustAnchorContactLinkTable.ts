import {MigrationInterface, QueryRunner, Table, TableIndex} from 'typeorm';

export class AddTrustAnchorContactLinkTable1748880200000 implements MigrationInterface {
  name = 'AddTrustAnchorContactLinkTable1748880200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'TrustAnchorContactLink',
        columns: [
          {name: 'id', type: 'varchar', isPrimary: true},
          {name: 'trustAnchorId', type: 'varchar'},
          {name: 'contactId', type: 'varchar'},
          {name: 'matchedType', type: 'varchar'},
          {name: 'matchedValue', type: 'text', isNullable: true},
          {name: 'createdAt', type: 'datetime', default: "datetime('now')"},
        ],
      }),
      true,
    );
    // No foreign keys on purpose: trust anchor deletion must never be blocked, and contactId
    // references the separate contact store. A unique index prevents duplicate links.
    await queryRunner.createIndex(
      'TrustAnchorContactLink',
      new TableIndex({name: 'IDX_TRUST_ANCHOR_CONTACT_LINK_UNIQUE', columnNames: ['trustAnchorId', 'contactId'], isUnique: true}),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('TrustAnchorContactLink');
  }
}
