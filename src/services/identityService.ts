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
  //const rsaPem = await generateRSAKeyAsPEM('RSA-PSS', 'SHA-256', 2048) << TODO this works in a unit test, figure out what's missing
  //  const publicKeyHex = publicKeyHexFromPEM(rsaPem);
  //const privateKeyHex = privateKeyHexFromPEM(rsaPem);
  const privateKeyHex =
    '308204bd020100300d06092a864886f70d0101010500048204a7308204a30201000282010100cbc8d20857c692f501371a08efcc1d0b3404c12fbbcc5cae359433f0b4c6ec708585857287bf815a56bf25303a0175c589a386f6dc3446c4b499af85f32934c45d5e9f14eafae0ed21e3ce3f4934477d10aef8521528a7644512abd2e7f76c5751995ae7ff440903221eaf5d2bce0ee26764fd49ea89f77aee46adb420ab5838b6ea8544d674e0b9e109c466997cde239b099e3766835376e8ac2550af64dd20cfcd7413db4c10401b4ccdb8fee717c937952e416e8c6e3e8d2854fd77debe9bd53932fd18a9fc856ac211622868fbdddc6d1f36197c9cdfe9ec95494bbd7e7d905762dd92da5f8ddc8ca9ba1fa108ac75c231fffb50ac8454bc52f5881e56470203010001028201002bfd4eb174592e31eb303cd37f081da0e47abe451291fbd3b34729ab252ae7b126717b2c0cf79ef1a45620adf7678747bbfd6bcdf01cecc5db826d6c49e0343ecb34f8bc28393dc292953d5955f10e1986376eed311a14804594d13876d06737b62a97800b0f61aea677df3d0a8eb191d7e5e9f341c8c47e69df21f2073755948db96b3f22ede004126753263648e67dfe8c1cba3fa6e409276d80a6e3e495f25001fc9f845ae80bc0e8bd21494b764801909ce87a4e0a9c9f84ff55f0aaecf6d462d50711df162aced1e650ce30480416ad42bfc60bbd7533cd7b66a6d03b25feb4f467efff19c661e2df161e0bf18af9a12689e0fbe98192d5c736fe2d2e5102818100f472b1a9e3d0e732baa3f3fafe3c18c66893794b86aebb978ccb4a3f3db17e7a71425b58a02a88167ab9ac77a5ffff2d05b47456bae74df79e6491d5a5ca857458a4c699385eac855852784b47fcb44aaab21488f4cd3fe314ad64dfad7aae382a57a06e7392bb8870077465f1fe0e2fd4db76031e9c7ab848d050b0e672774f02818100d56a2ed572b4229b2ca2308455df3d36be3675e003c8ba65f6e9167cc28b2e9b8c84e57e48f76f1b300bf44976ed9502797d4cc308370886030e8df48e2fb2ff40e7ffffa555e5d5ac8b561616e3b5234721ac409741fbd090f0f52a30598adeb53915ad20ff8d319a06c62ac5db4cbbb9a2c82a664a1289775e2c7d517c7389028181009a89c7f7f7a6a203582b3e9b770ed73ad7f223c4b3a8d3bfc3aae18d899b24b293d7b79817e9cb8f2a9727899cd072aa2be92183933597fceb8df9047083d04af59f764e776ca2f4ca1999233ea76bf3a8665cc518be899d2dfd50c078140f00430492d041108aae7ee4b7999b9b59acb38cead69e0b9f29d21ea064b5cbb7d102818046a4f587d6866686334a25014963b261b2a9586fa5110712c59ef6c0a9ad64ea3ca3a94c1a5f3dba243770cff8bc407d273620f8d679512afb4c10158a13a40ef6af55808c7c58ae58856f23b4c3ffac03d9d3a935e8b3b0a0aa029dca8f7976ab4a9030552202dd0e7d7b8fa11b2cd55f67d116a7f1911d4c143269f1555ef10281802f733e34a954a393d061c74a0b9324bfa7748a4a10d593db49da2577ebd4bc8fe30bb908345562791518096414b6fd75b2f49d17b6841419be1a98cb283b9fadbb2fc33759ddd8fdeffc501d767ac316a955b2e8a9b83fcbb0668a105acb80e4f4418c8d86db2a72e44e42695c4b87a6b4c55b0531771745dced0d6a0e819ee4';
  const publicKeyHex =
    '30820122300d06092a864886f70d01010105000382010f003082010a0282010100cbc8d20857c692f501371a08efcc1d0b3404c12fbbcc5cae359433f0b4c6ec708585857287bf815a56bf25303a0175c589a386f6dc3446c4b499af85f32934c45d5e9f14eafae0ed21e3ce3f4934477d10aef8521528a7644512abd2e7f76c5751995ae7ff440903221eaf5d2bce0ee26764fd49ea89f77aee46adb420ab5838b6ea8544d674e0b9e109c466997cde239b099e3766835376e8ac2550af64dd20cfcd7413db4c10401b4ccdb8fee717c937952e416e8c6e3e8d2854fd77debe9bd53932fd18a9fc856ac211622868fbdddc6d1f36197c9cdfe9ec95494bbd7e7d905762dd92da5f8ddc8ca9ba1fa108ac75c231fffb50ac8454bc52f5881e56470203010001';

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
