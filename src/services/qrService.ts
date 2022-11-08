import { IssuanceInitiationWithBaseUrl } from '@sphereon/oid4vci-client'
import Debug from 'debug'
import { URL } from 'react-native-url-polyfill'

import { APP_ID } from '../@config/constants'
import { IQrData, QrTypesEnum, SupportedDidMethodEnum } from '../@types'
import { translate } from '../localization/Localization'
import JwtVcPresentationProfileProvider from '../providers/credential/JwtVcPresentationProfileProvider'
import OpenId4VcIssuanceProvider from '../providers/credential/OpenId4VcIssuanceProvider'

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
