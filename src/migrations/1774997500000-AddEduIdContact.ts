import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddEduIdContact1774997500000 implements MigrationInterface {
  name = 'AddEduIdContact1774997500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "Party"(
                    id,
                    uri,
                    party_type_id,
                    created_at,
                    last_updated_at
                    ) VALUES (
                              '2eb52fa7-4891-4768-86cd-2e7bb0327996',
                              'https://issuer.dev.eduid.nl/eduid',
                              '3875c12e-fdaa-4ef6-a340-c936e054b627',
                              datetime('now'),
                              datetime('now')
                              )`,
    );

    await queryRunner.query(
      `INSERT INTO "BaseContact"(
                          id,
                          legal_name,
                          display_name,
                          party_id,
                          type,
                          created_at,
                          last_updated_at
                          ) VALUES (
                                    'feff6fc6-5be2-4d86-9a08-357248b54133',
                                    'eduID',
                                    'eduID',
                                    '2eb52fa7-4891-4768-86cd-2e7bb0327996',
                                    'Organization',
                                    datetime('now'),
                                    datetime('now')
                                    )`,
    );

    await queryRunner.query(
      `INSERT INTO "Identity"(
                       id,
                       alias,
                       origin,
                       roles,
                       partyId,
                       created_at,
                       last_updated_at
                       ) VALUES (
                                 'b6118565-01ae-4750-8ef8-d4b0ba6a7433',
                                 'https://issuer.dev.eduid.nl/eduid',
                                 'EXTERNAL',
                                 'FEDERATION OPERATOR',
                                 '2eb52fa7-4891-4768-86cd-2e7bb0327996',
                                 datetime('now'),
                                 datetime('now')
                                 )`,
    );

    await queryRunner.query(
      `INSERT INTO "CorrelationIdentifier"(
                                    id,
                                    type,
                                    correlation_id,
                                    identity_id
                                    ) VALUES (
                                              'a417221e-753c-478b-ae78-bb81975fabbb',
                                              'url',
                                              'https://issuer.dev.eduid.nl/eduid',
                                              'b6118565-01ae-4750-8ef8-d4b0ba6a7433'
                                              )`,
    );

    await queryRunner.query(
      `INSERT INTO "IssuerBranding"(
                             id,
                             issuerCorrelationId,
                             created_at,
                             last_updated_at
                             ) VALUES (
                                       'c1b3a0c2-f5cb-4b33-9215-e44873da634e',
                                       'https://issuer.dev.eduid.nl/eduid',
                                       datetime('now'),
                                       datetime('now')
                                       )`,
    );

    // nl locale logo
    await queryRunner.query(`INSERT INTO "ImageDimensions"(
                              id,
                              width,
                              height
                              ) VALUES (
                                        '23e3e414-20c3-4a9b-beb7-6c1ccc763fb1',
                                        200,
                                        200
                                        )`);

    await queryRunner.query(
      `INSERT INTO "ImageAttributes"(
                              id,
                              uri,
                              alt,
                              dimensionsId
                              ) VALUES (
                                        'cf0603cf-c7e2-447c-8246-886bb6f87ec2',
                                        'data:image/png;base64,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',
                                        'eduID',
                                        '23e3e414-20c3-4a9b-beb7-6c1ccc763fb1'
                                        )`,
    );

    // nl locale branding
    await queryRunner.query(
      `INSERT INTO "BaseLocaleBranding"(
                                 id,
                                 alias,
                                 issuerBrandingId,
                                 logoId,
                                 locale,
                                 description,
                                 type,
                                 contacts,
                                 created_at,
                                 last_updated_at
                                 ) VALUES (
                                           '1ba19e54-f352-4134-be04-d677aeab02c6',
                                           'eduID',
                                           'c1b3a0c2-f5cb-4b33-9215-e44873da634e',
                                           'cf0603cf-c7e2-447c-8246-886bb6f87ec2',
                                           'nl',
                                           'Uitgever van eduID Credentials',
                                           'IssuerLocaleBranding',
                                           'info@eduwallet.nl',
                                           datetime('now'),
                                           datetime('now')
                                           )`,
    );

    // en locale logo
    await queryRunner.query(`INSERT INTO "ImageDimensions"(
                              id,
                              width,
                              height
                              ) VALUES (
                                        '931aa25e-648c-4559-a619-0e19a8db428f',
                                        200,
                                        200
                                        )`);

    await queryRunner.query(
      `INSERT INTO "ImageAttributes"(
                              id,
                              uri,
                              alt,
                              dimensionsId
                              ) VALUES (
                                        '34a821d4-d551-4bb1-b932-433a4c74a851',
                                        'data:image/png;base64,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',
                                        'eduID',
                                        '931aa25e-648c-4559-a619-0e19a8db428f'
                                        )`,
    );

    // en locale branding
    await queryRunner.query(
      `INSERT INTO "BaseLocaleBranding"(
                                 id,
                                 alias,
                                 issuerBrandingId,
                                 logoId,
                                 locale,
                                 description,
                                 type,
                                 contacts,
                                 created_at,
                                 last_updated_at
                                 ) VALUES (
                                           'a62ffc01-95f2-4a9e-bb7c-e4accaf227d7',
                                           'eduID',
                                           'c1b3a0c2-f5cb-4b33-9215-e44873da634e',
                                           '34a821d4-d551-4bb1-b932-433a4c74a851',
                                           'en',
                                           'Issuer of eduID credentials',
                                           'IssuerLocaleBranding',
                                           'info@eduwallet.nl',
                                           datetime('now'),
                                           datetime('now')
                                           )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO implement migration down
    return Promise.reject(Error('Not yet implemented'));
  }
}
