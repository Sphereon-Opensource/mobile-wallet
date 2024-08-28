import {getVerifiableCredentialsFromStorage} from './credentialService';
import {PresentationDefinitionWithLocation} from '@sphereon/did-auth-siop';
import {PEX, SelectResults} from '@sphereon/pex';
import {PEXOptions} from '@sphereon/pex/dist/main/lib/PEX';
import {OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {generateDigest} from '../utils';

export const getMatchingCredentials = async ({
  presentationDefinitionWithLocation,
  opts,
}: {
  presentationDefinitionWithLocation: PresentationDefinitionWithLocation;
  opts?: PEXOptions;
}): Promise<Array<OriginalVerifiableCredential>> => {
  const credentials = await getVerifiableCredentialsFromStorage();
  if (!opts?.hasher) {
    opts = {
      hasher: generateDigest,
    };
  }
  const pex: PEX = new PEX(opts);

  const result: SelectResults = pex.selectFrom(
    presentationDefinitionWithLocation.definition,
    credentials.map(c => c.originalVerifiableCredential as OriginalVerifiableCredential),
  );

  return result.areRequiredCredentialsPresent !== 'error' && result.verifiableCredential ? result.verifiableCredential : [];
};
