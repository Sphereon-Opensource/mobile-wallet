import {ICredentialPlugin, IDataStore, IDataStoreORM, IDIDManager, IKeyManager, IResolver} from '@veramo/core';
import {IDidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {IContactManager} from '@sphereon/ssi-sdk.contact-manager';
import {ICredentialIssuer} from '@veramo/credential-w3c';
import {ICredentialHandlerLDLocal} from '@sphereon/ssi-sdk.vc-handler-ld-local';
import {IIssuanceBranding} from '@sphereon/ssi-sdk.issuance-branding';
import {IEventLogger} from '@sphereon/ssi-sdk.event-logger';

export type AgentTypes = IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  IDidAuthSiopOpAuthenticator &
  IContactManager &
  ICredentialPlugin &
  ICredentialIssuer &
  ICredentialHandlerLDLocal &
  IIssuanceBranding &
  IEventLogger;
