import {MusapClient, ExternalSscdSettings, SscdInfo} from '@sphereon/musap-react-native';
import {ESIMActivationMachineContext} from '../../types/machines/activateESimMachine';
import {storagePersistCoupledWithCode} from '../storageService';
import {MusapKeyManagementSystem} from '@sphereon/ssi-sdk-ext.kms-musap-rn';
import {sphereonKeyManager} from '../../agent/plugins';

export const checkMustEnableLink = async (): Promise<boolean> => {
  const linkId = MusapClient.getLink();
  console.log('Found existing MUSAP link', linkId);
  return linkId === null;
};

export const createMusapLink = async (): Promise<string> => {
  return await MusapClient.enableLink(
    'https://demo.methics.fi/sphereon/musaplink/musap?',
    undefined,
  );
};

export const checkSscd = async (): Promise<SscdInfo | undefined> => {
  const sscds = MusapClient.listEnabledSscds();
  const eSim = sscds.find(sscd => sscd.sscdInfo.provider === 'eSim');
  return eSim?.sscdInfo;
};

export const enableSscd = async (): Promise<SscdInfo> => {
  const settings: ExternalSscdSettings = {
    clientId: 'SCO',
    sscdName: 'eSim',
    provider: 'eSim',
  };
  console.log('calling enableSscd for eSim');
  MusapClient.enableSscd('EXTERNAL', 'eSim', settings);
  const sscds = MusapClient.listEnabledSscds();
  const sscdInfo = sscds.find(value => value.sscdId === 'eSim')?.sscdInfo;
  if (sscdInfo !== undefined) {
    return sscdInfo;
  }
  return Promise.reject(Error('enableSscd failed, sscdInfo of id eSim could not be found'));
};

export const cleanupKeys = async (): Promise<void> => {
  const existingKeys = MusapClient.listKeys();
  existingKeys
  .filter(value => value.keyAlias.startsWith('eSim-'))
  .forEach(value => {
    MusapClient.removeKey(value.keyUri);
  });
};

export const coupleWithRP = async (context: ESIMActivationMachineContext): Promise<string> => {
  if (!context.couplingCode) {
    throw new Error('Coupling code is required');
  }
  if (context.coupledWithCode) {
    console.log('coupleWithRelyingParty was already called for linkId', context.musapLinkId);
    return context.musapLinkId ?? ''; // FIXME
  }

  console.log('calling coupleWithRelyingParty with couplingCode', context.couplingCode);
  const linkId = await MusapClient.coupleWithRelyingParty(context.couplingCode);
  console.log('coupleWithRelyingParty successful. LinkID is', linkId);

  void await storagePersistCoupledWithCode(context.couplingCode);
  return linkId;
};

export const bindKey = async (context: ESIMActivationMachineContext): Promise<void> => {
  if (!context.msisdn || !context.sscdInfo) {
    throw new Error('MSISDN and SSCD info are required');
  }
  const bindAttrs = [{name: 'msisdn', value: context.msisdn}];
  console.log('bindKey is sscdId', context.sscdInfo.sscdId);
  console.log('calling bindKey with ms-isdn', context.msisdn);

  const response = await MusapClient.bindKey(context.sscdInfo.sscdId, {
    keyAlias: `eSim-${Date.now()}`,
    attributes: bindAttrs,
    keyUsages: ['personal'],
  });

  console.log('bindKey successful. keyUri is', response.keyUri);

  sphereonKeyManager.setKms('musap',
    new MusapKeyManagementSystem('EXTERNAL', 'eSim', {
      externalSscdSettings: { // FIXME this is still mandatory for ExternalSscd
        clientId: 'SCO',
      },
      defaultSignAttributes:
        {
          msisdn: context.msisdn,
          mimetype: 'application/x-sha256',
          signaturetype: 'pkcs1'
        },
    }));
  sphereonKeyManager.defaultKms = 'musap'
};
