import {MusapClient, ExternalSscdSettings, SscdInfo} from '@sphereon/musap-react-native';
import {ESIMActivationMachineContext} from '../../types/machines/activateESimMachine';

export const checkMustEnableLink = async (): Promise<boolean> => {
  const linkId = MusapClient.getLink();
  return linkId === null;
};

export const createMusapLink = async (): Promise<string> => {
  return await MusapClient.enableLink(
    'https://demo.methics.fi/sphereon/musaplink/musap?',
    undefined,
  );
};

export const checkSscd = async (): Promise<SscdInfo | undefined> => {
  const sscds = await MusapClient.listEnabledSscds();
  const eSim = sscds.find(sscd => sscd.sscdInfo.provider === 'eSim');
  return eSim?.sscdInfo;
};

export const enableSscd = async (): Promise<SscdInfo> => {
  const settings: ExternalSscdSettings = {
    clientId: 'SCO',
    sscdName: 'eSim Swisscom',
    provider: 'eSim',
  };
  MusapClient.enableSscd('EXTERNAL', 'eSim Swisscom', settings);
  const sscds = await MusapClient.listEnabledSscds();
  return sscds[0].sscdInfo;
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
  return await MusapClient.coupleWithRelyingParty(context.couplingCode);
};

export const bindKey = async (context: ESIMActivationMachineContext): Promise<void> => {
  if (!context.msisdn || !context.sscdInfo) {
    throw new Error('MSISDN and SSCD info are required');
  }
  const msIsdnAttrs = [{name: 'msisdn', value: context.msisdn}];
  await MusapClient.bindKey(context.sscdInfo.sscdId, {
    keyAlias: `eSim-${Date.now()}`,
    attributes: msIsdnAttrs,
    keyUsages: ['personal'],
  });
};
