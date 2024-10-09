import {CredentialDocumentFormat, DigitalCredential} from '@sphereon/ssi-sdk.data-store';
import {LogActivityEventArgs} from '@sphereon/ssi-sdk.event-logger';
import {
  ActionSubType,
  ActionType,
  CredentialMapper,
  InitiatorType,
  LoggingEventType,
  OriginalVerifiableCredential,
  SubSystem,
  System,
  WrappedVerifiableCredential,
} from '@sphereon/ssi-types';
import {CredentialType} from '@sphereon/ssi-sdk.core/src/types/events';

interface ActivityLogArgs {
  correlationId?: string;
  credential: DigitalCredential | OriginalVerifiableCredential;
  system: System;
  subSystemType: SubSystem;
  actionType: ActionType;
  actionSubType: ActionSubType;
  initiatorType: InitiatorType;
  description: string;
}

export const activityLogFrom = ({
  correlationId,
  credential,
  system,
  actionType,
  actionSubType,
  subSystemType,
  initiatorType,
  description,
}: ActivityLogArgs): LogActivityEventArgs => {
  if (isDigitalCredential(credential)) {
    return activityLogFromDigitalCredential({
      correlationId,
      credential,
      system,
      actionType,
      actionSubType,
      subSystemType,
      initiatorType,
      description,
    });
  }
  return activityLogFromWrappedVerifiableCredential({
    correlationId,
    credential: CredentialMapper.toWrappedVerifiableCredential(credential),
    system,
    actionType,
    actionSubType,
    subSystemType,
    initiatorType,
    description,
  });
};

export const activityLogFromDigitalCredential = ({
  correlationId,
  credential,
  system,
  actionType,
  actionSubType,
  subSystemType,
  initiatorType,
  description,
}: Omit<ActivityLogArgs, 'credential'> & {credential: DigitalCredential}): LogActivityEventArgs => {
  return {
    event: {
      correlationId,
      type: LoggingEventType.ACTIVITY,
      originalCredential: JSON.stringify(credential.rawDocument),
      system,
      subSystemType,
      actionType,
      actionSubType,
      description,
      initiatorType,
      data: JSON.stringify(credential),
      credentialHash: credential.hash,
      credentialType: credentialTypeFromDocumentFormat(credential.documentFormat),
    },
  };
};

export const activityLogFromWrappedVerifiableCredential = ({
  correlationId,
  credential,
  system,
  actionType,
  actionSubType,
  subSystemType,
  initiatorType,
  description,
}: Omit<ActivityLogArgs, 'credential'> & {credential: WrappedVerifiableCredential}): LogActivityEventArgs => {
  return {
    event: {
      correlationId,
      type: LoggingEventType.ACTIVITY,
      originalCredential: JSON.stringify(credential.original),
      system,
      subSystemType,
      actionType,
      actionSubType,
      description,
      initiatorType,
      data: JSON.stringify(credential),
      //todo: we need to provide this
      // credentialHash: credential.hash,
      credentialType: credentialTypeFromCredentialFormat(credential.format),
    },
  };
};

const isDigitalCredential = (credential: any): credential is DigitalCredential => {
  return (credential as DigitalCredential).documentFormat !== undefined;
};

const credentialTypeFromDocumentFormat = (documentFormat: CredentialDocumentFormat): CredentialType => {
  switch (documentFormat) {
    case CredentialDocumentFormat.JWT:
      return CredentialType.JWT;
    case CredentialDocumentFormat.MSO_MDOC:
      return CredentialType.MSO_MDOC;
    case CredentialDocumentFormat.JSON_LD:
      return CredentialType.JSON_LD;
    case CredentialDocumentFormat.SD_JWT:
      return CredentialType.SD_JWT;
    default:
      throw new Error(`Could not map the document format: ${documentFormat} to any known type.`);
  }
};

const credentialTypeFromCredentialFormat = (credentialFormat: 'jwt_vc' | 'ldp_vc' | 'ldp' | 'jwt' | 'vc+sd-jwt' | 'mso_mdoc'): CredentialType => {
  switch (credentialFormat) {
    case 'jwt':
    case 'jwt_vc':
      return CredentialType.JWT;
    case 'mso_mdoc':
      return CredentialType.MSO_MDOC;
    case 'ldp':
    case 'ldp_vc':
      return CredentialType.JSON_LD;
    case 'vc+sd-jwt':
      return CredentialType.SD_JWT;
    default:
      throw new Error(`Could not map the credential format: ${credentialFormat} to any known type.`);
  }
};
