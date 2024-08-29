import {getVerifiableCredentialsFromStorage} from './credentialService';
import {PresentationDefinitionWithLocation} from '@sphereon/did-auth-siop';
import {PEX, SelectResults} from '@sphereon/pex';
import {PEXOptions} from '@sphereon/pex/dist/main/lib/PEX';
import {OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {generateDigest} from '../utils';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
// FIXME Funke; we have a siopGetSelectableCredentials function in the SSI SDK which already does all the filtering and also retrieves the branding, issuerParty & subjectParty
export const getMatchingCredentials = async ({
  presentationDefinitionWithLocation,
  opts,
}: {
  presentationDefinitionWithLocation: PresentationDefinitionWithLocation;
  opts?: PEXOptions;
}): Promise<Array<UniqueDigitalCredential>> => {
  const credentials = await getVerifiableCredentialsFromStorage();
  if (!opts?.hasher) {
    opts = {
      hasher: generateDigest,
    };
  }

  const format =
    presentationDefinitionWithLocation.definition.format ??
    presentationDefinitionWithLocation.definition.input_descriptors.some(pd => {
      if ('format' in pd) {
        return pd.format;
      }
    });

  const pex: PEX = new PEX(opts);

  const udcMap = new Map<OriginalVerifiableCredential, UniqueDigitalCredential>();
  credentials.forEach(credential => {
    udcMap.set(credential.originalVerifiableCredential!, credential);
  });

  const result: SelectResults = pex.selectFrom(
    presentationDefinitionWithLocation.definition,
    credentials.map(c => c.originalVerifiableCredential as OriginalVerifiableCredential),
  );

  if (result.vcIndexes && result.vcIndexes.length === result.verifiableCredential?.length) {
    const subsetCredentials = [];
    for (let i = 0; i < result.vcIndexes.length; i++) {
      const index = result.vcIndexes[i];
      if (index < 0 || index >= credentials.length) {
        throw new Error(`Index ${index} at position ${i} is out of bounds. Valid range is 0 to ${credentials.length - 1}.`);
      }
      const credential = credentials[index];
      credential.originalVerifiableCredential = result.verifiableCredential?.[i];
      subsetCredentials.push(credential);
    }
    return subsetCredentials;
  }
  return result.areRequiredCredentialsPresent !== 'error' && result.verifiableCredential
    ? result.verifiableCredential.map(vc => udcMap.get(vc)!)
    : [];
};
