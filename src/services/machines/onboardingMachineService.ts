import {MappedCredential, OnboardingMachineContext} from '../../types/machines/onboarding';
import {CredentialMapper} from '@sphereon/ssi-types';
import {CredentialCorrelationType, CredentialRole} from '@sphereon/ssi-sdk.data-store';
import {computeEntryHash} from '@veramo/utils';
import {generateDigest} from '../../utils';
import agent from '../../agent';

export const retrievePIDCredentials = async (context: Pick<OnboardingMachineContext, 'funkeProvider'>): Promise<Array<MappedCredential>> => {
  const {funkeProvider} = context;

  if (!funkeProvider?.refreshUrl) {
    return Promise.reject(Error('Missing ausweis refresh url in context'));
  }

  return funkeProvider
    .getAuthorizationCode()
    .then((authorizationCode: string) => funkeProvider.getPids({authorizationCode}))
    .then(pidResponses => {
      return pidResponses.map(pidResponse => {
        const credential = pidResponse.credential;
        const rawCredential = typeof credential === 'string' ? credential : JSON.stringify(credential);
        const uniformCredential = CredentialMapper.toUniformCredential(rawCredential, {hasher: generateDigest});

        return {
          uniformCredential,
          rawCredential,
        };
      });
    });
};

export const storePIDCredentials = async (context: Pick<OnboardingMachineContext, 'pidCredentials'>): Promise<void> => {
  const {pidCredentials} = context;

  pidCredentials.forEach((mappedCredential: MappedCredential) =>
    agent.crsAddCredential({
      credential: {
        rawDocument: mappedCredential.rawCredential,
        credentialRole: CredentialRole.HOLDER,
        credentialId: mappedCredential.uniformCredential.id ?? computeEntryHash(mappedCredential.rawCredential),
        issuerCorrelationType: CredentialCorrelationType.X509_CN,
        issuerCorrelationId: 'https://demo.pid-issuer.bundesdruckerei.de',
      },
      opts: {hasher: generateDigest},
    }),
  );
};
