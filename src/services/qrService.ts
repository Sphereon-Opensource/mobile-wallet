import { CredentialResponse, IssuanceInitiationWithBaseUrl } from '@sphereon/oid4vci-client'
import { ConnectionIdentifierEnum, ConnectionTypeEnum } from '@sphereon/ssi-sdk-data-store-common'
import { CredentialMapper } from '@sphereon/ssi-types/src/mapper/credential-mapper'
import { VerifiableCredential } from '@veramo/core'
import Debug from 'debug'
import { URL } from 'react-native-url-polyfill'

import { APP_ID } from '../@config/constants'
import {
  ConnectionStatusEnum,
  IQrAuthentication,
  IQrData,
  IQrDataArgs,
  IQrDidSiopAuthenticationRequest,
  NavigationBarRoutesEnum,
  QrTypesEnum,
  ScreenRoutesEnum
} from '../@types'
import { translate } from '../localization/Localization'
import JwtVcPresentationProfileProvider from '../providers/credential/JwtVcPresentationProfileProvider'
import OpenId4VcIssuanceProvider from '../providers/credential/OpenId4VcIssuanceProvider'
import store from '../store';
import {storeVerifiableCredential} from '../store/actions/credential.actions'
import { showToast, ToastTypeEnum } from '../utils/ToastUtils'
import { toCredentialSummary } from '../utils/mappers/CredentialMapper'

import { authenticate } from './authenticationService'
import { connectFrom } from './connectionService'
import { getOrCreatePrimaryIdentifier } from './identityService'

const debug = Debug(`${APP_ID}:qrService`)

export const parseQr = async (qrData: string): Promise<IQrData> => {
  try {
    const parsedJson = JSON.parse(qrData)
    if (parsedJson && typeof parsedJson === 'object') {
      return parsedJson
    }
  } catch (error: unknown) {
    debug(`Unable to parse QR value as JSON. Error: ${error}`)
  }

  try {
    const param = new URL(qrData).searchParams.get('oob')
    if (param) {
      return {
        ...JSON.parse(Buffer.from(param, 'base64').toString('utf8')),
        redirectUrl: qrData
      }
    }
  } catch (error: unknown) {
    debug(`Unable to parse QR value as URL. Error: ${error}`)
  }

  if (qrData.startsWith(QrTypesEnum.OPENID_VC)) {
    try {
      return parseOpenIdVc(qrData)
    } catch (error: unknown) {
      debug(`Unable to parse QR value as openid-vc. Error: ${error}`)
    }
  }

  if (qrData.startsWith(QrTypesEnum.OPENID_INITIATE_ISSUANCE)) {
    try {
      return parseOpenId4VcIssuance(qrData)
    } catch (error: unknown) {
      debug(`Unable to parse QR value as openid-initiate-issuance. Error: ${error}`)
    }
  }

  return Promise.reject(Error(translate('qr_scanner_qr_not_supported_message')))
}

const parseOpenIdVc = (qrData: string): Promise<IQrData> => {
  const jwtVcPresentationProfileProvider = new JwtVcPresentationProfileProvider()
  return (
    jwtVcPresentationProfileProvider
      .getUrl(qrData)
      .then((url: string) => jwtVcPresentationProfileProvider.getRequest(url))
      // TODO (any) typings when process is clear
      .then((request: any) => ({
        type: QrTypesEnum.OPENID_VC,
        ...request
      }))
      .catch((error: Error) => {
        return Promise.reject(error)
      })
  )
}

const parseOpenId4VcIssuance = (qrData: string): Promise<IQrData> => {
  return new OpenId4VcIssuanceProvider()
    .getIssuanceInitiationFromUri({ uri: qrData })
    .then((issuanceInitiation: IssuanceInitiationWithBaseUrl) => ({
      type: QrTypesEnum.OPENID_INITIATE_ISSUANCE,
      issuanceInitiation
    }))
    .catch((error: Error) => {
      return Promise.reject(error)
    })
}

export const processQr = async (args: IQrDataArgs) => {
  switch (args.qrData.type) {
    case QrTypesEnum.AUTH:
      switch ((args.qrData as IQrAuthentication).mode) {
        case ConnectionTypeEnum.DIDAUTH:
          return connectDidAuth(args)
      }
      break
    case QrTypesEnum.SIOPV2:
      return connectSiopV2(args)
    case QrTypesEnum.OPENID_VC:
      return connectJwtVcPresentationProfile(args)
    case QrTypesEnum.OPENID_INITIATE_ISSUANCE:
      return connectOpenId4VcIssuance(args)
  }
}

const connectDidAuth = async (args: IQrDataArgs) => {
  const identifier = await getOrCreatePrimaryIdentifier() // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
  const connection = connectFrom({
    type: ConnectionTypeEnum.DIDAUTH,
    identifier: {
      type: ConnectionIdentifierEnum.DID,
      correlationId: identifier.did
    },
    config: {
      identifier,
      stateId: (args.qrData as IQrDidSiopAuthenticationRequest).state,
      redirectUrl: (args.qrData as IQrDidSiopAuthenticationRequest).redirectUrl,
      sessionId: (args.qrData as IQrDidSiopAuthenticationRequest).redirectUrl + identifier.did
    }
  })

  authenticate(connection)
    .then(() => console.log('authentication success'))
    .catch((error) => {
      if (!/UserCancel|UserFallback|SystemCancel/.test(error.name)) {
        console.error('Error', error)
      }
    })
}

const connectSiopV2 = async (args: IQrDataArgs) => {
  const purpose = args.qrData.body?.accept?.includes(ConnectionTypeEnum.SIOPV2_OIDC4VP)
    ? translate('siop_oidc4vp_authentication_request_message')
    : translate('siop_authentication_request_message')

  args.navigation.navigate(ScreenRoutesEnum.CONNECTION_DETAILS, {
    entityName: new URL(args.qrData.redirectUrl.split('?')[0]).host,
    connection: connectFrom({
      type: ConnectionTypeEnum.DIDAUTH,
      identifier: {
        type: ConnectionIdentifierEnum.URL,
        correlationId: args.qrData.redirectUrl
      },
      config: {
        sessionId: args.qrData.id,
        redirectUrl: args.qrData.redirectUrl,
        stateId: args.qrData.state,
        identifier: await getOrCreatePrimaryIdentifier() // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
      },
      metadata: [
        {
          label: translate('metadata_purpose_label'),
          value: purpose
        },
        {
          label: translate('metadata_rp_did_label'),
          value: args.qrData.from
        },
        {
          label: translate('metadata_connection_url_label'),
          value: args.qrData.redirectUrl.split('?')[0]
        }
      ]
    }),
    connectionStatus: ConnectionStatusEnum.DISCONNECTED
  })
}

const connectJwtVcPresentationProfile = async (args: IQrDataArgs) => {
  if (args.qrData.pin) {
    const manifest = await new JwtVcPresentationProfileProvider().getManifest(args.qrData)
    args.navigation.navigate(ScreenRoutesEnum.VERIFICATION_CODE, {
      pinLength: args.qrData.pin.length,
      credentialName: manifest.display.card.title || '[MISSING CREDENTIAL NAME]', // TODO translate
      // TODO WAL-301 need to send a response with a pin code to complete the process.
      onVerification: async (pin: string) =>
        await args.navigation.navigate(NavigationBarRoutesEnum.HOME, { screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW })
    })
  }
  // TODO WAL-301 need to send a response when we do not need a pin code
}

const connectOpenId4VcIssuance = async (args: IQrDataArgs) => {
  const sendResponse = async (
    issuanceInitiation: IssuanceInitiationWithBaseUrl,
    pin?: string
  ): Promise<void> =>
    new OpenId4VcIssuanceProvider()
      .getCredentialFromIssuance({
        issuanceInitiation,
        ...(pin && { pin })
      })
      .then((credentialResponse: CredentialResponse) => {
        const vc = CredentialMapper.toUniformCredential(credentialResponse.credential)
        const rawCredential = credentialResponse.credential as unknown as VerifiableCredential

        // TODO fix this type issue
        const storeCredential = async (vc: VerifiableCredential) => await store.dispatch(storeVerifiableCredential(vc))

        args.navigation.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
          rawCredential,
          credential: toCredentialSummary(vc),
          primaryAction: {
            caption: translate('action_accept_label'),
            onPress: async () => storeCredential(rawCredential)
              .then(() => args.navigation.navigate(NavigationBarRoutesEnum.HOME, {
                screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW
              }))
              .then(() => showToast(ToastTypeEnum.TOAST_SUCCESS, translate('credential_offer_accepted_toast')))
              .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, error.message))
          },
          secondaryAction: {
            caption: translate('action_decline_label'),
            onPress: async () => args.navigation.navigate(ScreenRoutesEnum.QR_READER)
          }
        })
      })
      .catch((error: Error) => {
        return Promise.reject(error)
      })

  // TODO user_pin_required needs an update from the lib to be an actual boolean
  if (args.qrData.issuanceInitiation.issuanceInitiationRequest.user_pin_required === 'true') {
    args.navigation.navigate(ScreenRoutesEnum.VERIFICATION_CODE, {
      credentialName: Array.isArray(args.qrData.issuanceInitiation.issuanceInitiationRequest.credential_type)
        ? args.qrData.issuanceInitiation.issuanceInitiationRequest.credential_type.join(', ')
        : args.qrData.issuanceInitiation.issuanceInitiationRequest.credential_type,
      onVerification: async (pin: string) => await sendResponse(args.qrData.issuanceInitiation, pin)
    })
  } else {
    await sendResponse(args.qrData.issuanceInitiation)
  }
}
