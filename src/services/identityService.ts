import {IIdentifier, IKey} from '@veramo/core';

import {DID_PREFIX} from '../@config/constants';
import {didManagerCreate, didManagerFind, didManagerGet, didManagerImport} from '../agent';
import store from '../store';
import {getContacts} from '../store/actions/contact.actions';
import {addIdentifier} from '../store/actions/user.actions';
import {ICreateIdentifierArgs, ICreateOrGetIdentifierArgs, IdentifierAliasEnum, KeyManagementSystemEnum} from '../types';
import {generateRSAKeyAsPEM, jwkDetermineUse, JwkKeyUse, privateKeyHexFromPEM, publicKeyHexFromPEM, toJwk} from '@sphereon/ssi-sdk-ext.key-utils';
import {base64UrlEncodeString} from '../utils/TextUtils';

export const getIdentifiers = async (): Promise<IIdentifier[]> => {
  // TODO fully implement
  return didManagerFind();
};

async function createRSAIdentifier(args: ICreateIdentifierArgs): Promise<IIdentifier> {
  //const rsaPem = await generateRSAKeyAsPEM('RSA-PSS')
  const rsaPem = atob(
    'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQ0KTUlJRW9nSUJBQUtDQVFCL2J1U0cvY3d4ekpPZU0xWGJpNThvUW9EclFmdmRyT0YydjVPb3RNV0JtRDdwTHZyQQ0KLzEvVWJSblVHeUphVmUwWmJub1cvb2dNMitPbFAvZUI4QWRZckFFL3VUTlgzYVZLQ3RRNm5BZGV0eHcwb1FQVg0KVmVqUUlOMHlTNWQvdTdEaG4yTWVvdUROaUZyM21SNWUvSHV3WTBvRURSMHpPenFjZ1Vac2RZMTBHcm5WUldkVg0KcERwOFI2K2hIbDBsQzBQNHBUR0hIVnQ0Rk41eGhxejZyVWwxdlFENXZkRGJFZjZVZVpsYU9ZVDkwUVQwY2lvdA0KWkZmczYxREtmbFZJZy9WeEJTMWZ4VTZFakNWeFh1dGx2VXI3RnVNNW1IdVB5a1hiUURjL3VNQ1dsRDVReHBrSg0KNWtwNzJucG1OWE1Nci9UMzFZNWpPUE5zMkszcFg5SHBNSWR0QWdNQkFBRUNnZ0VBVkw0cjN0RmNQeW1xYVNQKw0KVHBlVTZiTUFCSExHeVcyMEtjSFFzZm8wOWErRzlvNjFWaTc5VFVpWVNvTVkzellSREQ1NWxsMEJvSHVCOFZ5Tw0KZmF4ZlZrcGNNa0k0c0kvRzRXdytJaE9zbXdIdUVkbVpzUDhHYVpIUlJ5Y1p3bW5RZ05uN2tsNENYT3YyZ24waQ0KdzB2bi9TNnFBL09zbldzZjJQL25FeTFCT2htbUpKcUd5bHhERTd5OWkrK01BeW9TU0FaOWZlYytteXk3V0JiNA0KZm9kanpJVlpyamJrS1VhWFp0UW96cWlIWGVxckR2VUo5aUdzeUZrd0wyNXZsR3VZVEZHK3FDT1RMMU81QnljRQ0KOGR2dGZPSk5CSmswRDRzcTVVT2FLL2p6OC9QN3pIZ0dDZXBzdjRTYzhFYTlxQlU4Z01NYUZZaXJ4ZjNPdnJEUg0KZ1pDZnlRS0JnUUQ3NHBLdjVWUUJJaUxxbm1FbUMvNG5iQjZKcWxxTnNQRXZqWmxVR3FNNkZ2SWhXOFJzQjVUOQ0KMXVpUXMzbDlGdUNNbU5ZSjZyV0p2NVU0M0NGQmhHK3kxWDhHTlhoZ09KK2ExSWhJbCtWYzNqU2x2ejk3a2FQVQ0KL3hYUkNCdXYzaHE1aXVLRGxReDRMR21OQ3NXR3FScElQbUs2L2NuT2pSWUVtckFrU1MyUUF3S0JnUUNCZzljZw0KaCtXcFdIUDNndUVxRUsrbzRMc2MvTDhRb2hRVUxTK0ZJZmcyZzltK3lMakJHdjVuSFo3Wi90RVp1NS9XamlZbw0KeFZpTDRoYzZHakVOTjZBUmpHcDRFdjI5NDcvWm45VjQ2dHNZRzJlZGpDc0R1V2ZUMVlsdWtwSksrVFRVYU9zbg0KTWp5MlI2M3hoY0ZaVmJlQll0dElveUZMV0VNRDdhT0ttaU1IendLQmdRQzZIZU4zZHdOSVJ4bjN0SWxpSEpCeQ0KUHJDZDFqTk02UVo5dGFvcSsvZktEM1JmODdmQ2Z5TzNJSm45ZWEvMkh2WlN6UWV5a2l3TG1YVkFhMTlqVXVGYQ0KQ2VqdkJJbHF4OHdmRXBXVTFpL1RIQmxZczJUTUFJUkcrU2o4cUhvVXpBK0JNNzlGck5kbTRLSXBabUVuckVIUQ0KU2RDWURMaVdGNmZDUlM2TDBVcUtVd0tCZ0RBSktSbjhyVmFBNHdvUzlkWTNPQitIc242TzA0S2t5cE90S3FuVA0KTG85eG1hb2tJam9rKytSYzNSVDNhTENGb1VQZmx4R2FHRHhSajlIUjh3MTI2eHgzR3VvTUNTYUx1UlZMTGM3YQ0KTklhZGEzSElrZytnalh6SS8xOE9aOG44NGZaQ0w2MXErWStWeUZNREMvSkpVM1ZlcC93cDNPaG9CUHNKQVpZZg0Ka3d5TEFvR0FXREFlbStKSW1aZlVzSlUzcjUwQUkrU3JRd2Yxb05hN211UFlrYTl3OHo0VnRiZFRXUWJTMS9QeQ0KRTAxY2ovNm1uTXhPK3hsYUQxWnNpL2xuTDVuV2pVYnVkUk41Z2hwczk2aVV4cU5mWHlleXJzZG85NHYzTFliTg0KVzFwN0hvcDlUZGZWQVIrT3E1c2lmOXZWVDRva1RsVG5CNDJjbTBTbm9Sbk0xaUxVZE9ZPQ0KLS0tLS1FTkQgUlNBIFBSSVZBVEUgS0VZLS0tLS0',
  );
  const publicKeyHex = publicKeyHexFromPEM(rsaPem);
  const privateKeyHex = privateKeyHexFromPEM(rsaPem);

  const keyType = 'RSA';

  const use = jwkDetermineUse(keyType, JwkKeyUse.Signature);
  const jwk: JsonWebKey = toJwk(publicKeyHex, keyType, {use});
  const did = `did:jwk:${base64UrlEncodeString(JSON.stringify(jwk))}`;

  return await didManagerImport({
    did: did,
    ...(args?.method && {provider: `${DID_PREFIX}:${args?.method}`}),
    keys: [
      {
        type: keyType,
        privateKeyHex: privateKeyHex,
        publicKeyHex: publicKeyHex,
        kms: 'local',
      },
    ],
  });
}

export const createIdentifier = async (args?: ICreateIdentifierArgs): Promise<IIdentifier> => {
  const identifier =
    args?.createOpts?.options?.type === 'RSA'
      ? await createRSAIdentifier(args)
      : await didManagerCreate({
          kms: args?.createOpts?.kms || KeyManagementSystemEnum.LOCAL,
          ...(args?.method && {provider: `${DID_PREFIX}:${args?.method}`}),
          alias:
            args?.createOpts?.alias ||
            `${IdentifierAliasEnum.PRIMARY}-${args?.method}-${args?.createOpts?.options?.type}-${new Date().toUTCString()}`,
          options: args?.createOpts?.options,
        });

  if (store.getState().user.users.size > 0) {
    await store.dispatch<any>(addIdentifier({did: identifier.did})).then(() => {
      setTimeout(() => {
        store.dispatch<any>(getContacts());
      }, 1000);
    });
  }

  return identifier;
};

export const getOrCreatePrimaryIdentifier = async (args?: ICreateOrGetIdentifierArgs): Promise<IIdentifier> => {
  const identifiers = (await didManagerFind(args?.method ? {provider: `${DID_PREFIX}:${args?.method}`} : {})).filter(
    (identifier: IIdentifier) =>
      args?.createOpts?.options?.type === undefined || identifier.keys.some((key: IKey) => key.type === args?.createOpts?.options?.type),
  );

  console.log(`Currently available identifiers for ${args?.method} / ${args?.createOpts?.options?.type}: ${identifiers.length}`);

  // Currently we only support one identifier
  const identifier: IIdentifier = !identifiers || identifiers.length == 0 ? await createIdentifier(args) : identifiers[0];

  return didManagerGet({did: identifier.did});
};
