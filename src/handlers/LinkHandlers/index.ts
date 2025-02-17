import {LinkHandlers} from '@sphereon/ssi-sdk.core';
import {OID4VCIHolderLinkHandler} from '@sphereon/ssi-sdk.oid4vci-holder';
import {IAgentContext} from '@veramo/core';
import {
  firstPartyStateNavigationListener,
  oid4vciStateNavigationListener
} from '../../navigation/machines/oid4vciStateNavigation';
import {QrTypesEnum} from '../../types';
import {SIOPv2OID4VPLinkHandler} from './SIOPLinkHandler';

export const addLinkListeners = (linkHandlers: LinkHandlers, context: IAgentContext<any>): void => {
  linkHandlers.add([
    new OID4VCIHolderLinkHandler({
      protocols: [`${QrTypesEnum.OPENID_CREDENTIAL_OFFER}:`, `${QrTypesEnum.OPENID_INITIATE_ISSUANCE}:`],
      // FIXME partialIssuanceOpt param does not exist
      // partialIssuanceOpt: {
      //   kms: KeyManagementSystemEnum.MUSAP,
      // },
      trustAnchors: ['https://federation.demo.sphereon.com', 'https://federation.dev.findy.fi'],
      stateNavigationListener: oid4vciStateNavigationListener,
      firstPartyStateNavigationListener: firstPartyStateNavigationListener,
      context,
    }),
    new SIOPv2OID4VPLinkHandler({
      protocols: [QrTypesEnum.OPENID4VP, QrTypesEnum.OPENID4VC, QrTypesEnum.OPENID_VC, QrTypesEnum.SIOPV2, QrTypesEnum.OPENID],
      context,
    }),
  ]);
};
