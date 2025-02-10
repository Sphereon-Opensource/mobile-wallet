import {MigrationInterface, QueryRunner} from 'typeorm';
import {v4 as uuidv4} from 'uuid';
import {bootcampFederationTrustAnchors} from '../@config/trustanchors';
import {findyLogoPng} from '../assets/images/findyLogoPng';
import {sphereonLogoPng} from '../assets/images/sphereonLogo';

export class AddTrustAnchorContacts1730209432321 implements MigrationInterface {
  name = 'AddTrustAnchorContacts1730209432321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "Party"(id,
                           uri,
                           party_type_id,
                           created_at,
                           last_updated_at)
       VALUES ('654d698e-fd26-4ac7-8098-7e14870140df',
               'https://federation.demo.sphereon.com',
               '3875c12e-fdaa-4ef6-a340-c936e054b627',
               datetime('now'),
               datetime('now'))`,
    );

    await queryRunner.query(
      `INSERT INTO "BaseContact"(id,
                                 legal_name,
                                 display_name,
                                 party_id,
                                 type,
                                 created_at,
                                 last_updated_at)
       VALUES ('0014e6b8-9271-4d4a-939c-dd1b23880f4d',
               'Sphereon Federation',
               'Sphereon Federation',
               '654d698e-fd26-4ac7-8098-7e14870140df',
               'Organization',
               datetime('now'),
               datetime('now'))`,
    );

    await queryRunner.query(
      `INSERT INTO "Identity"(id,
                              alias,
                              origin,
                              roles,
                              partyId,
                              created_at,
                              last_updated_at)
       VALUES ('66b16b8c-cf94-449c-820d-fd888dec7a88',
               'https://federation.demo.sphereon.com',
               'EXTERNAL',
               'FEDERATION OPERATOR',
               '654d698e-fd26-4ac7-8098-7e14870140df',
               datetime('now'),
               datetime('now'))`,
    );

    await queryRunner.query(
      `INSERT INTO "CorrelationIdentifier"(id,
                                           type,
                                           correlation_id,
                                           identity_id)
       VALUES ('2b4130d5-bc01-4428-9f8e-8ff1e536f666',
               'url',
               'https://federation.demo.sphereon.com',
               '66b16b8c-cf94-449c-820d-fd888dec7a88')`,
    );

    await queryRunner.query(
      `INSERT INTO "IssuerBranding"(id,
                                    issuerCorrelationId,
                                    created_at,
                                    last_updated_at)
       VALUES ('999ae111-6d66-46da-ac01-858d1df87a83',
               'https://federation.demo.sphereon.com',
               datetime('now'),
               datetime('now'))`,
    );

    await queryRunner.query(`INSERT INTO "ImageDimensions"(id,
                                                           width,
                                                           height)
                             VALUES ('3f38b5b9-bf7c-4eab-91c4-6970578b9d3a',
                                     3750,
                                     3750)`);

    await queryRunner.query(
      `INSERT INTO "ImageAttributes"(id,
                                     uri,
                                     alt,
                                     dimensionsId)
       VALUES ('19803a99-8d0a-4fe8-8565-278032b7903b',
               '${sphereonLogoPng}',
               'sphereon logo',
               '3f38b5b9-bf7c-4eab-91c4-6970578b9d3a')`,
    );

    await queryRunner.query(
      `INSERT INTO "BaseLocaleBranding"(id,
                                        issuerBrandingId,
                                        logoId,
                                        locale,
                                        type,
                                        client_uri,
                                        tos_uri,
                                        policy_uri,
                                        contacts,
                                        created_at,
                                        last_updated_at)
       VALUES ('d969e748-1ae7-45df-8638-a716350869d5',
               '999ae111-6d66-46da-ac01-858d1df87a83',
               '19803a99-8d0a-4fe8-8565-278032b7903b',
               '',
               'IssuerLocaleBranding',
               'https://sphereon.com',
               'https://sphereon.com/sphereon-wallet-terms-and-conditions',
               'https://sphereon.com/sphereon-wallet-privacy-policy',
               'dev@sphereon.com,support@sphereon.com',
               datetime('now'),
               datetime('now'))`,
    );

    await queryRunner.query(
      `INSERT INTO "Party"(id,
                           uri,
                           party_type_id,
                           created_at,
                           last_updated_at)
       VALUES ('7f16a97f-19e8-4387-bcac-a23f82797f8f',
               'https://federation.dev.findy.fi',
               '3875c12e-fdaa-4ef6-a340-c936e054b627',
               datetime('now'),
               datetime('now'))`,
    );

    await queryRunner.query(
      `INSERT INTO "BaseContact"(id,
                                 legal_name,
                                 display_name,
                                 party_id,
                                 type,
                                 created_at,
                                 last_updated_at)
       VALUES ('7e585fee-7f7e-469d-8c99-96a7ec3e60e4',
               'Findynet Federation',
               'Findynet Federation',
               '7f16a97f-19e8-4387-bcac-a23f82797f8f',
               'Organization',
               datetime('now'),
               datetime('now'))`,
    );

    await queryRunner.query(
      `INSERT INTO "Identity"(id,
                              alias,
                              origin,
                              roles,
                              partyId,
                              created_at,
                              last_updated_at)
       VALUES ('8cea5ccd-59bf-4c72-9844-ddfcfdf6ca56',
               'https://federation.dev.findy.fi',
               'EXTERNAL',
               'FEDERATION OPERATOR',
               '7f16a97f-19e8-4387-bcac-a23f82797f8f',
               datetime('now'),
               datetime('now'))`,
    );

    await queryRunner.query(
      `INSERT INTO "CorrelationIdentifier"(id,
                                           type,
                                           correlation_id,
                                           identity_id)
       VALUES ('d56bb8f2-db52-4923-a4ff-9e835e16290c',
               'url',
               'https://federation.dev.findy.fi',
               '8cea5ccd-59bf-4c72-9844-ddfcfdf6ca56')`,
    );

    await queryRunner.query(
      `INSERT INTO "IssuerBranding"(id,
                                    issuerCorrelationId,
                                    created_at,
                                    last_updated_at)
       VALUES ('e6523745-aa00-43ee-8c92-d352243c64b1',
               'https://federation.dev.findy.fi',
               datetime('now'),
               datetime('now'))`,
    );

    await queryRunner.query(`INSERT INTO "ImageDimensions"(id,
                                                           width,
                                                           height)
                             VALUES ('e17767fc-91b8-4546-af34-91305c89571d',
                                     256,
                                     256)`);

    await queryRunner.query(
      `INSERT INTO "ImageAttributes"(id,
                                     uri,
                                     alt,
                                     dimensionsId)
       VALUES ('154f90c0-2135-439e-b23d-458e3d781589',
               '${findyLogoPng}',
               'findynet logo',
               'e17767fc-91b8-4546-af34-91305c89571d')`,
    );

    await queryRunner.query(
      `INSERT INTO "BaseLocaleBranding"(id,
                                        issuerBrandingId,
                                        logoId,
                                        locale,
                                        type,
                                        client_uri,
                                        tos_uri,
                                        policy_uri,
                                        contacts,
                                        created_at,
                                        last_updated_at)
       VALUES ('8c66b536-eb30-45f8-8ed0-2f4a2203c16f',
               'e6523745-aa00-43ee-8c92-d352243c64b1',
               '154f90c0-2135-439e-b23d-458e3d781589',
               '',
               'IssuerLocaleBranding',
               'https://sphereon.com',
               'https://sphereon.com/sphereon-wallet-terms-and-conditions',
               'https://sphereon.com/sphereon-wallet-privacy-policy',
               'dev@sphereon.com,support@sphereon.com',
               datetime('now'),
               datetime('now'))`,
    );

    await this.upBootcamp(queryRunner);
  }

  private async upBootcamp(queryRunner: QueryRunner) {
    let counter = 1;
    for (const url of bootcampFederationTrustAnchors) {
      const partyId = uuidv4();
      const contactId = uuidv4();
      const identityId = uuidv4();
      const correlationId = uuidv4();
      const issuerBrandingId = uuidv4();
      const imageDimensionsId = uuidv4();
      const imageAttributesId = uuidv4();
      const localeBrandingId = uuidv4();

      await queryRunner.query(
        `INSERT INTO "Party"(id,
                             uri,
                             party_type_id,
                             created_at,
                             last_updated_at)
         VALUES ('${partyId}',
                 '${url}',
                 '3875c12e-fdaa-4ef6-a340-c936e054b627',
                 datetime('now'),
                 datetime('now'))`,
      );

      await queryRunner.query(
        `INSERT INTO "BaseContact"(id,
                                   legal_name,
                                   display_name,
                                   party_id,
                                   type,
                                   created_at,
                                   last_updated_at)
         VALUES ('${contactId}',
                 'Findynet Bootcamp Federation ${counter}',
                 'Findynet Bootcamp Federation ${counter}',
                 '${partyId}',
                 'Organization',
                 datetime('now'),
                 datetime('now'))`,
      );

      await queryRunner.query(
        `INSERT INTO "Identity"(id,
                                alias,
                                origin,
                                roles,
                                partyId,
                                created_at,
                                last_updated_at)
         VALUES ('${identityId}',
                 '${url}',
                 'EXTERNAL',
                 'FEDERATION OPERATOR',
                 '${partyId}',
                 datetime('now'),
                 datetime('now'))`,
      );

      await queryRunner.query(
        `INSERT INTO "CorrelationIdentifier"(id,
                                             type,
                                             correlation_id,
                                             identity_id)
         VALUES ('${correlationId}',
                 'url',
                 '${url}',
                 '${identityId}')`,
      );

      await queryRunner.query(
        `INSERT INTO "IssuerBranding"(id,
                                      issuerCorrelationId,
                                      created_at,
                                      last_updated_at)
         VALUES ('${issuerBrandingId}',
                 '${url}',
                 datetime('now'),
                 datetime('now'))`,
      );

      await queryRunner.query(`INSERT INTO "ImageDimensions"(id,
                                                             width,
                                                             height)
                               VALUES ('${imageDimensionsId}',
                                       256,
                                       256)`,
      );

      await queryRunner.query(
        `INSERT INTO "ImageAttributes"(id,
                                       uri,
                                       alt,
                                       dimensionsId)
         VALUES ('${imageAttributesId}',
                 '${findyLogoPng}',
                 'findynet logo',
                 '${imageDimensionsId}')`,
      );

      await queryRunner.query(
        `INSERT INTO "BaseLocaleBranding"(id,
                                          issuerBrandingId,
                                          logoId,
                                          locale,
                                          type,
                                          client_uri,
                                          tos_uri,
                                          policy_uri,
                                          contacts,
                                          created_at,
                                          last_updated_at)
         VALUES ('${localeBrandingId}',
                 '${issuerBrandingId}',
                 '${imageAttributesId}',
                 '',
                 'IssuerLocaleBranding',
                 'https://sphereon.com',
                 'https://sphereon.com/sphereon-wallet-terms-and-conditions',
                 'https://sphereon.com/sphereon-wallet-privacy-policy',
                 'dev@sphereon.com,support@sphereon.com',
                 datetime('now'),
                 datetime('now'))`,
      );

      counter++;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO implement migration down
    return Promise.reject(Error('Not yet implemented'));
  }
}
