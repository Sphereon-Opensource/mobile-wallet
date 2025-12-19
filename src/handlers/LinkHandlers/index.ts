import {LinkHandlers} from '@sphereon/ssi-sdk.core';
import {OID4VCIHolderLinkHandler} from '@sphereon/ssi-sdk.oid4vci-holder';
import {IAgentContext} from '@veramo/core';
import {firstPartyStateNavigationListener, oid4vciStateNavigationListener} from '../../navigation/machines/oid4vciStateNavigation';
import {QrTypesEnum} from '../../types';
import {SIOPv2OID4VPLinkHandler} from './SIOPLinkHandler';
import {DefaultURISchemes} from '@sphereon/oid4vci-common';

let listenersAdded = false;

const cleanupStaleOID4VCIMachines = async (context: IAgentContext<any>): Promise<void> => {
  // Defensive: only try to clean when the persistence methods are available
  const agent: any = context.agent;
  if (!agent?.availableMethods || typeof agent.machineStatesFindActive !== 'function' || typeof agent.machineStateDelete !== 'function') {
    return;
  }

  const available = agent.availableMethods();
  if (!available.includes('machineStatesFindActive') || !available.includes('machineStateDelete')) {
    return;
  }

  const activeStates = await agent.machineStatesFindActive({machineName: 'OID4VCIHolder'});
  if (!activeStates || activeStates.length === 0) {
    return;
  }

  await Promise.all(
    activeStates.map((state: any) =>
      agent.machineStateDelete({machineName: 'OID4VCIHolder', instanceId: state.instanceId}).catch(() => undefined),
    ),
  );
};

export const addLinkListeners = async (linkHandlers: LinkHandlers, context: IAgentContext<any>): Promise<void> => {
  if (listenersAdded) {
    return;
  }
  listenersAdded = true;
  await cleanupStaleOID4VCIMachines(context);
  linkHandlers.add([
    new OID4VCIHolderLinkHandler({
      protocols: [`${QrTypesEnum.OPENID_CREDENTIAL_OFFER}:`, `${QrTypesEnum.OPENID_INITIATE_ISSUANCE}:`],
      // FIXME partialIssuanceOpt param does not exist
      // partialIssuanceOpt: {
      //   kms: KeyManagementSystemEnum.MUSAP,
      // },
      authorizationRequestOpts: {
        clientId: 'https://sphereon.com/ssi-wallet',
        redirectUri: 'https://sphereon.com/ssi-wallet/oid4vci-callback',
      },
      trustAnchors: ['https://federation.demo.sphereon.com', 'https://federation.dev.findy.fi'],
      stateNavigationListener: oid4vciStateNavigationListener,
      firstPartyStateNavigationListener: firstPartyStateNavigationListener,
      walletType: 'NATURAL_PERSON',
      context,
    }),
    new SIOPv2OID4VPLinkHandler({
      protocols: [QrTypesEnum.OPENID4VP, QrTypesEnum.OPENID4VC, QrTypesEnum.OPENID_VC, QrTypesEnum.SIOPV2, QrTypesEnum.OPENID],
      context,
    }),
  ]);
};
