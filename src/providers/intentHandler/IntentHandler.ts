import { ICredential } from '@sphereon/ssi-types'
import { ProofType, UnsignedCredential, VerifiableCredential } from '@veramo/core'
import Debug from "debug";
import { Linking } from 'react-native'
import * as RNFS from 'react-native-fs'
import ShareMenuModule from 'react-native-share-menu'

import {APP_ID} from "../../@config/constants";
import { NavigationBarRoutesEnum, ScreenRoutesEnum } from '../../@types'
import { SharedItem } from '../../@types/intents'
import { translate } from '../../localization/Localization'
import * as RootNavigation from '../../navigation/rootNavigation'
import { readQr } from '../../services/qrService'
import store from '../../store'
import { storeVerifiableCredential } from '../../store/actions/credential.actions'
import { showToast, ToastTypeEnum } from '../../utils/ToastUtils'
import { toCredentialSummary } from '../../utils/mappers/CredentialMapper'

class IntentHandler {
  private debug = Debug(`${APP_ID}:intentHandler`);

  public static enable = async (): Promise<void> => {
    this.debug('enabling intent handler')
    await IntentHandler.addListeners()
    await IntentHandler.getDataOnStartup()
  }

  private static addListeners = async (): Promise<void> => {
    Linking.addEventListener('url', IntentHandler.deepLinkListener)
    ShareMenuModule.addNewShareListener(IntentHandler.sharedFileDataListener)
  }

  private static async getDataOnStartup(): Promise<void> {
    this.debug('get intent data on startup')
    await IntentHandler.handleDeepLinkData()
    await IntentHandler.handleSharedFileData()
  }

  private static async handleDeepLinkData(): Promise<void> {
    this.debug('handleDeepLinkData')
    Linking.getInitialURL().then((url: string | null) => {
      // Added expo-development-client check because of how the expo works in development
      if (url === null || url.includes('expo-development-client')) {
        return
      }

      IntentHandler.deepLinkListener({ url })
    })
  }

  private static async handleSharedFileData(): Promise<void> {
    this.debug('handleSharedFileData')
    await ShareMenuModule.getSharedText((data: any) => {
      IntentHandler.sharedFileDataListener(data)
    })
  }

  private static deepLinkListener = async (event: { url: string }): Promise<void> => {
    // TODO this DeepLinkingProvider is now hard-coupled to assume the links are QR flows
    // TODO fix this type issue
    await readQr({ qrData: event.url, navigation: RootNavigation })
  }

  private static async sharedFileDataListener(item?: SharedItem): Promise<void> {
    if (item) {
      RNFS.readFile(item.data).then((fileString: string) => {
        const vc: VerifiableCredential = JSON.parse(fileString)?.credential?.data?.verifiableCredential[0]
        if (vc) {
          const storeCredential = async (vc: VerifiableCredential) => {
            await store.dispatch(storeVerifiableCredential(vc))
          }

          const params = {
            vc,
            credential: toCredentialSummary(vc as ICredential),
            primaryAction: {
              caption: translate('action_accept_label'),
              onPress: IntentHandler.onAccept(storeCredential, vc)
            },
            secondaryAction: {
              caption: translate('action_decline_label'),
              onPress: IntentHandler.onDecline()
            }
          }
          this.debug('navigating to Credential Details Screen.')
          RootNavigation.navigate(NavigationBarRoutesEnum.HOME, {
            screen: ScreenRoutesEnum.CREDENTIAL_DETAILS,
            params: params
          })
        } else {
          showToast(ToastTypeEnum.TOAST_ERROR, translate('vc_not_found'))
        }
      })
    }
  }

  private static onDecline() {
    return async () =>
      RootNavigation.navigate(NavigationBarRoutesEnum.HOME, {
        screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW
      })
  }

  private static onAccept(
    storeCredential: (vc: VerifiableCredential) => Promise<void>,
    vc: UnsignedCredential & { proof: ProofType }
  ) {
    return async () =>
      storeCredential(vc)
        .then(() =>
          RootNavigation.navigate(NavigationBarRoutesEnum.HOME, {
            screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW
          })
        )
        .then(() => showToast(ToastTypeEnum.TOAST_SUCCESS, translate('credential_offer_accepted_toast')))
        .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, error.message))
  }
}

export default IntentHandler
