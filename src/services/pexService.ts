import {getVerifiableCredentialsFromStorage} from './credentialService';
import {PresentationDefinitionWithLocation} from '@sphereon/did-auth-siop';
import {PEX, SelectResults} from '@sphereon/pex';
import {PEXOptions} from '@sphereon/pex/dist/main/lib/PEX';
import {CredentialMapper, decodeMdocIssuerSigned, Loggers, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {generateDigest} from '../utils';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {MdocOid4vpIssuerSigned} from '@sphereon/ssi-types/src/types/mso_mdoc';
import {com} from '@sphereon/kmp-mdl-mdoc';
import encodeTo = com.sphereon.kmp.encodeTo;
import Encoding = com.sphereon.kmp.Encoding;
import IOid4VPPresentationDefinition = com.sphereon.mdoc.oid4vp.IOid4VPPresentationDefinition;

const logger = Loggers.DEFAULT.get('sphereon:pexService');

const collectFormats = (presentationDefinitionWithLocation: PresentationDefinitionWithLocation): string[] => {
  const formats: string[] = [];
  if (typeof presentationDefinitionWithLocation.definition.format === 'object') {
    Object.keys(presentationDefinitionWithLocation.definition.format).forEach(fmtKey => formats.push(fmtKey));
  }

  presentationDefinitionWithLocation.definition.input_descriptors.forEach(pd => {
    if ('format' in pd && typeof pd.format === 'object') {
      Object.keys(pd.format).forEach(fmtKey => formats.push(fmtKey));
    }
  });
  return formats;
};

// FIXME Funke; we have a siopGetSelectableCredentials function in the SSI SDK which already does all the filtering and also retrieves the branding, issuerParty & subjectParty
export const getMatchingCredentials = async ({
  presentationDefinitionWithLocation,
  opts,
}: {
  presentationDefinitionWithLocation: PresentationDefinitionWithLocation;
  opts?: PEXOptions;
}): Promise<Array<UniqueDigitalCredential>> => {
  if (!opts?.hasher) {
    opts = {
      hasher: generateDigest,
    };
  }

  const subsetCredentials = [];

  const credentials = await getVerifiableCredentialsFromStorage({parentsOnly: false});
  const formats = collectFormats(presentationDefinitionWithLocation);
  if (formats.includes('mso_mdoc') || formats.includes('MSO_MDOC')) {
    credentials
      .filter(uniqueDC => uniqueDC.digitalCredential.documentFormat === 'MSO_MDOC')
      .forEach(uniqueDC => {
        try {
          const holderMdoc = decodeMdocIssuerSigned(uniqueDC.originalVerifiableCredential! as MdocOid4vpIssuerSigned);
          const deviceResponse = holderMdoc.toSingleDocDeviceResponse(presentationDefinitionWithLocation.definition as IOid4VPPresentationDefinition);
          if (deviceResponse) {
            const vp_token = encodeTo(deviceResponse.cborEncode(), Encoding.BASE64URL);
            uniqueDC.originalVerifiablePresentation = vp_token; // TODO Funke reevaluate
            const wvp = CredentialMapper.toWrappedVerifiablePresentation(deviceResponse);
            if (wvp.vcs.length == 0) {
              return Promise.reject('credential could not be extracted from mdoc');
            }
            uniqueDC.originalVerifiableCredential = wvp.vcs[0].credential; // FIXME Funke
            subsetCredentials.push(uniqueDC);
          }
        } catch (e) {
          console.error('Could not decode mdoc credential', e);
          logger.error('Could not decode mdoc credential', e); // FIXME I can't see this in the console log
        }
      });
  }

  const pex: PEX = new PEX(opts);

  const result: SelectResults = pex.selectFrom(
    presentationDefinitionWithLocation.definition,
    credentials
      .filter(uniqueDC => uniqueDC.digitalCredential.documentFormat !== 'MSO_MDOC')
      .map(c => c.originalVerifiableCredential as OriginalVerifiableCredential),
  );

  if (
    result.areRequiredCredentialsPresent !== 'error' &&
    result.verifiableCredential &&
    result.vcIndexes &&
    result.vcIndexes.length === result.verifiableCredential?.length
  ) {
    for (let i = 0; i < result.vcIndexes.length; i++) {
      const index = result.vcIndexes[i];
      if (index < 0 || index >= credentials.length) {
        throw new Error(`Index ${index} at position ${i} is out of bounds. Valid range is 0 to ${credentials.length - 1}.`);
      }
      const credential = credentials[index];
      credential.originalVerifiableCredential = result.verifiableCredential?.[i];
      subsetCredentials.push(credential);
    }
  }
  return subsetCredentials;
};
