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
import {IOIDFClient} from '@sphereon/ssi-sdk.oidf-client';
import {IQRCodeGenerator} from '@sphereon/ssi-sdk.qr-code-generator';
import {IEventLogger} from '@sphereon/ssi-sdk.event-logger';
import {IAnomalyDetection} from '@sphereon/ssi-sdk.anomaly-detection';
import {IResourceResolver} from '@sphereon/ssi-sdk.resource-resolver';

export type TAgentTypes = IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IEventLogger &
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
  ISDJwtPlugin &
  IOIDFClient &
  IResourceResolver &
  IQRCodeGenerator &
  IAnomalyDetection;

export type IRequiredContext = IAgentContext<TAgentTypes>;
