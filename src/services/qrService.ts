import { CredentialResponse, IssuanceInitiation } from '@sphereon/openid4vci-client'
import {
  ConnectionTypeEnum,
  CorrelationIdentifierEnum
} from '@sphereon/ssi-sdk-data-store-common'
import { CredentialMapper } from '@sphereon/ssi-types'
import { VerifiableCredential } from '@veramo/core'
import Debug from 'debug'
import { URL } from 'react-native-url-polyfill'

import { APP_ID } from '../@config/constants'
import {
  ConnectionStatusEnum,
  ICredentialMetadata,
  ICredentialTypeSelection,
  IErrorDetails,
  IQrAuthentication,
  IQrData,
  IQrDataArgs,
  IQrDidSiopAuthenticationRequest,
  IReadQrArgs,
  IServerMetadataAndCryptoMatchingResponse,
  NavigationBarRoutesEnum,
  PopupImagesEnum,
  QrTypesEnum,
  ScreenRoutesEnum
} from '../@types'
import { translate } from '../localization/Localization'
import JwtVcPresentationProfileProvider from '../providers/credential/JwtVcPresentationProfileProvider'
import OpenId4VcIssuanceProvider from '../providers/credential/OpenId4VcIssuanceProvider'
import store from '../store'
import { createContact } from '../store/actions/contact.actions'
import { storeVerifiableCredential } from '../store/actions/credential.actions'
import { showToast, ToastTypeEnum } from '../utils/ToastUtils'
import { toCredentialSummary } from '../utils/mappers/CredentialMapper'

import { authenticate } from './authenticationService'
import { connectFrom } from './connectionService'
import { getContacts } from './contactService'
import { getOrCreatePrimaryIdentifier } from './identityService'

const { v4: uuidv4 } = require('uuid')

const debug = Debug(`${APP_ID}:qrService`)

export const readQr = async (args: IReadQrArgs): Promise<void> => {
  parseQr(args.qrData)
    .then((qrData: IQrData) => processQr({ qrData, navigation: args.navigation }))
    .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, error.message))
}

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
  try {
    return Promise.resolve({
      type: QrTypesEnum.OPENID_INITIATE_ISSUANCE,
      issuanceInitiation: IssuanceInitiation.fromURI(qrData),
      uri: qrData
    })
  } catch (error) {
    console.log(error)
    return Promise.reject(error)
  }
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
      type: CorrelationIdentifierEnum.DID,
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
        type: CorrelationIdentifierEnum.URL,
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
  const sendResponse = async (provider: OpenId4VcIssuanceProvider, pin?: string): Promise<void> =>
    provider
      .getCredentialsFromIssuance({ pin })
      .then((credentialsResponse: Record<string, CredentialResponse>) => {
        for (const credentialResponse of Object.values(credentialsResponse)) {
          const vc = CredentialMapper.toUniformCredential(credentialResponse.credential)
          const rawCredential = credentialResponse.credential as unknown as VerifiableCredential

          const storeCredential = async (vc: VerifiableCredential) =>
              store.dispatch(storeVerifiableCredential(vc))

          // We are specifically navigating to a stack, so that when a deeplink is used the navigator knows in which stack it is
          args.navigation.navigate(NavigationBarRoutesEnum.QR, {
            screen: ScreenRoutesEnum.CREDENTIAL_DETAILS,
            params: {
              rawCredential,
              credential: toCredentialSummary(vc),
              primaryAction: {
                caption: translate('action_accept_label'),
                onPress: async () =>
                  storeCredential(rawCredential)
                    .then(() =>
                      args.navigation.navigate(NavigationBarRoutesEnum.HOME, {
                        screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW
                      })
                    )
                    .then(() => showToast(ToastTypeEnum.TOAST_SUCCESS, translate('credential_offer_accepted_toast')))
                    .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, error.message))
              },
              secondaryAction: {
                caption: translate('action_decline_label'),
                onPress: async () => args.navigation.navigate(ScreenRoutesEnum.QR_READER)
              }
            }
          })
        }
      })
      .catch((error: Error) => {
        // TODO refactor once the lib returns a proper response object
        const errorResponse = JSON.parse(error.message.split('response:')[1].trim())

        if (errorResponse?.status === 403) {
          return Promise.reject(error)
        }

        const errorDetails: IErrorDetails = OpenId4VcIssuanceProvider.getErrorDetails(errorResponse.error)

        args.navigation.navigate(ScreenRoutesEnum.ERROR, {
          image: PopupImagesEnum.WARNING,
          title: errorDetails.title,
          details: errorDetails.message,
          detailsPopup: {
            buttonCaption: translate('action_view_extra_details'),
            title: errorDetails.detailsTitle,
            details: `${errorDetails.detailsMessage} ${errorResponse.error_description}`
          },
          primaryButton: {
            caption: translate('action_ok_label'),
            onPress: async () => args.navigation.navigate(ScreenRoutesEnum.QR_READER, {})
          }
        })
      })

  const provider = await OpenId4VcIssuanceProvider.initiationFromUri({ uri: args.qrData.uri })
  provider.getServerMetadataAndPerformCryptoMatching().then(async (metadata: IServerMetadataAndCryptoMatchingResponse) => {
    const url = new URL(metadata.serverMetadata.issuer)
    const contacts = await getContacts({ filter: [{ identifier: { correlationId: url.hostname } }] })
    if (contacts.length === 0) {
      store.dispatch(
          createContact({
            name: url.host,
            alias: url.host,
            uri: `${url.protocol}//${url.hostname}`,
            identifier: {
              type: CorrelationIdentifierEnum.URL,
              correlationId: url.hostname
            }
          })
      )
    }

    const gotoVerificationCode = async (credentials: Array<string>): Promise<void> => {
      if (
        args.qrData.issuanceInitiation.issuanceInitiationRequest.user_pin_required === 'true' ||
        args.qrData.issuanceInitiation.issuanceInitiationRequest.user_pin_required === true
      ) {
        args.navigation.navigate(NavigationBarRoutesEnum.QR, {
          screen: ScreenRoutesEnum.VERIFICATION_CODE,
          params: {
            // Currently we only support receiving one credential, we are missing ui to display multiple
            credentialName: credentials[0],
            onVerification: async (pin: string) => await sendResponse(provider, pin)
          }
        })
      } else {
        await sendResponse(provider)
      }
    }

    const credentialTypes: Array<ICredentialTypeSelection> = metadata.credentialsSupported.map(
      (credentialMetadata: ICredentialMetadata) => ({
        id: uuidv4(),
        credentialType: credentialMetadata.credentialType,
        isSelected: true
      })
    )

    if (credentialTypes.length > 1) {
      args.navigation.navigate(ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE, {
        issuer: args.qrData.issuanceInitiation.issuanceInitiationRequest.issuer,
        credentialTypes: metadata.credentialsSupported.map((credentialMetadata: ICredentialMetadata) => ({
          id: uuidv4(),
          credentialType: credentialMetadata.credentialType,
          isSelected: true
        })),
        onAccept: async (credentialTypes: Array<string>) => await gotoVerificationCode(credentialTypes)
      })
    } else {
      await gotoVerificationCode(
          credentialTypes.map((credentialSelection: ICredentialTypeSelection) => credentialSelection.credentialType)
      )
    }
  })
  .catch((error: Error) => {
    debug(`Unable to retrieve vc. Error: ${error}`)
    //TODO create human readable error message
    showToast(ToastTypeEnum.TOAST_ERROR, error.message)
  })
}
