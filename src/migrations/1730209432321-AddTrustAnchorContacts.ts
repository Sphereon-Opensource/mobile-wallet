import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddTrustAnchorContacts1730209432321 implements MigrationInterface {
  name = 'AddTrustAnchorContacts1730209432321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "Party"(
                    id, 
                    uri, 
                    party_type_id, 
                    created_at, 
                    last_updated_at
                    ) VALUES (
                              '654d698e-fd26-4ac7-8098-7e14870140df', 
                              'https://federation.demo.sphereon.com', 
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
                                    '0014e6b8-9271-4d4a-939c-dd1b23880f4d', 
                                    'Sphereon Federation', 
                                    'Sphereon Federation', 
                                    '654d698e-fd26-4ac7-8098-7e14870140df', 
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
                                 '66b16b8c-cf94-449c-820d-fd888dec7a88', 
                                 'https://federation.demo.sphereon.com', 
                                 'EXTERNAL', 
                                 'FEDERATION OPERATOR', 
                                 '654d698e-fd26-4ac7-8098-7e14870140df', 
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
                                              '2b4130d5-bc01-4428-9f8e-8ff1e536f666', 
                                              'url', 
                                              'https://federation.demo.sphereon.com', 
                                              '66b16b8c-cf94-449c-820d-fd888dec7a88'
                                              )`,
    );

    await queryRunner.query(
      `INSERT INTO "IssuerBranding"(
                             id, 
                             issuerCorrelationId, 
                             created_at, 
                             last_updated_at
                             ) VALUES (
                                       '999ae111-6d66-46da-ac01-858d1df87a83', 
                                       'https://federation.demo.sphereon.com', 
                                       datetime('now'), 
                                       datetime('now')
                                       )`,
    );

    await queryRunner.query(`INSERT INTO "ImageDimensions"(
                              id, 
                              width, 
                              height
                              ) VALUES (
                                        '3f38b5b9-bf7c-4eab-91c4-6970578b9d3a', 
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
                                        '19803a99-8d0a-4fe8-8565-278032b7903b', 
                                        'data:image/png;base64,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', 
                                        'sphereon logo', 
                                        '3f38b5b9-bf7c-4eab-91c4-6970578b9d3a'
                                        )`,
    );

    await queryRunner.query(
      `INSERT INTO "BaseLocaleBranding"(
                                 id, 
                                 issuerBrandingId, 
                                 logoId, 
                                 locale, 
                                 type,
                                 client_uri,
                                 tos_uri,
                                 policy_uri,
                                 contacts,
                                 created_at, 
                                 last_updated_at
                                 ) VALUES (
                                           'd969e748-1ae7-45df-8638-a716350869d5', 
                                           '999ae111-6d66-46da-ac01-858d1df87a83', 
                                           '19803a99-8d0a-4fe8-8565-278032b7903b', 
                                           '', 
                                           'IssuerLocaleBranding',
                                           'https://sphereon.com',
                                           'https://sphereon.com/sphereon-wallet-terms-and-conditions',
                                           'https://sphereon.com/sphereon-wallet-privacy-policy',
                                           'dev@sphereon.com,support@sphereon.com',
                                           datetime('now'), 
                                           datetime('now')
                                           )`,
    );

    await queryRunner.query(
      `INSERT INTO "Party"(
                    id, 
                    uri, 
                    party_type_id, 
                    created_at, 
                    last_updated_at
                    ) VALUES (
                              '7f16a97f-19e8-4387-bcac-a23f82797f8f', 
                              'https://federation.dev.findy.fi', 
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
                                    '7e585fee-7f7e-469d-8c99-96a7ec3e60e4', 
                                    'Findynet Federation', 
                                    'Findynet Federation', 
                                    '7f16a97f-19e8-4387-bcac-a23f82797f8f', 
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
                                 '8cea5ccd-59bf-4c72-9844-ddfcfdf6ca56', 
                                 'https://federation.dev.findy.fi', 
                                 'EXTERNAL', 
                                 'FEDERATION OPERATOR', 
                                 '7f16a97f-19e8-4387-bcac-a23f82797f8f', 
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
                                              'd56bb8f2-db52-4923-a4ff-9e835e16290c', 
                                              'url', 
                                              'https://federation.dev.findy.fi', 
                                              '8cea5ccd-59bf-4c72-9844-ddfcfdf6ca56'
                                              )`,
    );

    await queryRunner.query(
      `INSERT INTO "IssuerBranding"(
                             id,
                             issuerCorrelationId, 
                             created_at, 
                             last_updated_at
                             ) VALUES (
                                       'e6523745-aa00-43ee-8c92-d352243c64b1',
                                       'https://federation.dev.findy.fi',
                                       datetime('now'), 
                                       datetime('now')
                                       )`,
    );

    await queryRunner.query(`INSERT INTO "ImageDimensions"(
                              id, 
                              width, 
                              height
                              ) VALUES (
                                        'e17767fc-91b8-4546-af34-91305c89571d', 
                                        256,
                                        256
                                        )`);

    await queryRunner.query(
      `INSERT INTO "ImageAttributes"(
                              id, 
                              uri, 
                              alt, 
                              dimensionsId
                              ) VALUES (
                                        '154f90c0-2135-439e-b23d-458e3d781589', 
                                        'data:image/png;base64,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', 
                                        'findynet logo', 
                                        'e17767fc-91b8-4546-af34-91305c89571d'
                                        )`,
    );

    await queryRunner.query(
      `INSERT INTO "BaseLocaleBranding"(
                                 id, 
                                 issuerBrandingId, 
                                 logoId, 
                                 locale, 
                                 type,
                                 client_uri,
                                 tos_uri,
                                 policy_uri,
                                 contacts,
                                 created_at, 
                                 last_updated_at
                                 ) VALUES (
                                           '8c66b536-eb30-45f8-8ed0-2f4a2203c16f', 
                                           'e6523745-aa00-43ee-8c92-d352243c64b1', 
                                           '154f90c0-2135-439e-b23d-458e3d781589', 
                                           '', 
                                           'IssuerLocaleBranding',
                                           'https://sphereon.com',
                                           'https://sphereon.com/sphereon-wallet-terms-and-conditions',
                                           'https://sphereon.com/sphereon-wallet-privacy-policy',
                                           'dev@sphereon.com,support@sphereon.com',
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
