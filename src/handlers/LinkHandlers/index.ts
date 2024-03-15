import {LinkHandlers} from '@sphereon/ssi-sdk.core';
import {OID4VCIHolderLinkHandler} from '@sphereon/ssi-sdk.oid4vci-holder';
import {agentContext} from '../../agent';
import {oid4vciStateNavigationListener} from '../../navigation/machines/oid4vciStateNavigation';
import {QrTypesEnum} from '../../types';
import {SIOPv2OID4VPLinkHandler} from './SIOPLinkHandler';

export const addLinkListeners = (linkHandlers: LinkHandlers) => {
  linkHandlers.add([
    new OID4VCIHolderLinkHandler({
      protocols: [QrTypesEnum.OPENID_CREDENTIAL_OFFER + ':', QrTypesEnum.OPENID_INITIATE_ISSUANCE + ':'],
      stateNavigationListener: oid4vciStateNavigationListener,
      context: agentContext,
    }),
    new SIOPv2OID4VPLinkHandler({
      protocols: [QrTypesEnum.OPENID4VC, QrTypesEnum.OPENID_VC, QrTypesEnum.SIOPV2, QrTypesEnum.OPENID],
      context: agentContext,
    }),
  ]);
};
