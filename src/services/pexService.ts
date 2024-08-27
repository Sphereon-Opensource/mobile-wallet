import {getVerifiableCredentialsFromStorage} from './credentialService';
import {PresentationDefinitionWithLocation} from '@sphereon/did-auth-siop';
import {PEX, SelectResults} from '@sphereon/pex';
import {PEXOptions} from '@sphereon/pex/dist/main/lib/PEX';
import {OriginalVerifiableCredential} from '@sphereon/ssi-types';

export const getMatchingCredentials = async ({
  presentationDefinitionWithLocation,
  opts,
}: {
  presentationDefinitionWithLocation: PresentationDefinitionWithLocation;
  opts?: PEXOptions;
}): Promise<Array<OriginalVerifiableCredential>> => {
  const credentials = await getVerifiableCredentialsFromStorage();
  const pex: PEX = new PEX(opts);

  const result: SelectResults = pex.selectFrom(
    presentationDefinitionWithLocation.definition,
    credentials.map(c => c.originalCredential as OriginalVerifiableCredential),
  );

  return result.areRequiredCredentialsPresent !== 'error' && result.verifiableCredential ? result.verifiableCredential : [];
};
