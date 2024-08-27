import {IAgentContext, ICredentialPlugin, IDataStore, IDataStoreORM, IDIDManager, IKeyManager, IResolver} from '@veramo/core';
import {IDidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {IContactManager} from '@sphereon/ssi-sdk.contact-manager';
import {ICredentialIssuer} from '@veramo/credential-w3c';
import {ICredentialHandlerLDLocal} from '@sphereon/ssi-sdk.vc-handler-ld-local';
import {IIssuanceBranding} from '@sphereon/ssi-sdk.issuance-branding';
import {IOID4VCIHolder} from '@sphereon/ssi-sdk.oid4vci-holder';
import {IMachineStatePersistence} from '@sphereon/ssi-sdk.xstate-machine-persistence';
import {ISDJwtPlugin} from '@sphereon/ssi-sdk.sd-jwt';
import {ICredentialStore} from '@sphereon/ssi-sdk.credential-store';
import {IJwtService} from '@sphereon/ssi-sdk-ext.jwt-service';
import {IIdentifierResolution} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {ImDLMdoc} from '@sphereon/ssi-sdk.mdl-mdoc';

export type TAgentTypes = IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  IIdentifierResolution &
  IJwtService &
  IDidAuthSiopOpAuthenticator &
  IContactManager &
  ICredentialPlugin &
  ICredentialIssuer &
  ICredentialHandlerLDLocal &
  IIssuanceBranding &
  IOID4VCIHolder &
  IMachineStatePersistence &
  ICredentialStore &
  ImDLMdoc &
  ISDJwtPlugin;

export type IRequiredContext = IAgentContext<TAgentTypes>;
