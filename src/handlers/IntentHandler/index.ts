import {ICredential} from '@sphereon/ssi-types';
import {VerifiableCredential} from '@veramo/core';
import Debug from 'debug';
import {EmitterSubscription, Linking} from 'react-native';
import ShareMenu, {ShareData, ShareListener} from 'react-native-share-menu';

import {APP_ID} from '../../@config/constants';
import {translate} from '../../localization/Localization';
import RootNavigation from '../../navigation/rootNavigation';
import {readFile} from '../../services/fileService';
import {readQr} from '../../services/qrService';
import store from '../../store';
import {storeVerifiableCredential} from '../../store/actions/credential.actions';
import {NavigationBarRoutesEnum, ScreenRoutesEnum, ToastTypeEnum} from '../../types';
import {showToast} from '../../utils/ToastUtils';
import {toNonPersistedCredentialSummary} from '../../utils/mappers/CredentialMapper';

const debug = Debug(`${APP_ID}:IntentHandler`);

class IntentHandler {
  private deeplinkListener: EmitterSubscription;
  private shareListener: ShareListener;

  public enable = async (): Promise<void> => {
    await this.addListeners();
    await this.getDataOnStartup();
  };

  public disable = async (): Promise<void> => {
    await this.removeListeners();
  };

  private addListeners = async (): Promise<void> => {
    this.deeplinkListener = Linking.addEventListener('url', this.deepLinkListener);
    this.shareListener = ShareMenu.addNewShareListener(this.sharedFileDataListener);
  };

  private removeListeners = async (): Promise<void> => {
    this.deeplinkListener?.remove();
    this.shareListener?.remove();
  };

  private async getDataOnStartup(): Promise<void> {
    await this.handleDeepLinkData();
    await this.handleSharedFileData();
  }

  private async handleDeepLinkData(): Promise<void> {
    Linking.getInitialURL().then((url: string | null) => {
      debug(`Receiving deeplink data: ${url}`);
      // Added expo-development-client check because of how the expo works in development
      if (!url || url.includes('expo-development-client')) {
        return;
      }
      this.deepLinkListener({url});
    });
  }

  private async handleSharedFileData(): Promise<void> {
    await ShareMenu.getSharedText((data?: ShareData) => {
      debug(`Receiving shared data: ${JSON.stringify(data, null, 2)}`);
      if (!data) {
        return;
      }
      // TODO Added a timeout to let the navigationRef be mounted. This should be removed once we have a better loading check (appIsReady) that includes the navigation ref
      setTimeout(() => {
        this.sharedFileDataListener(data);
      }, 1000);
    });
  }

  private deepLinkListener = async (event: {url: string}): Promise<void> => {
    // TODO this DeepLinkingProvider is now hard-coupled to assume the links are QR flows
    // TODO fix this type issue
    await readQr({qrData: event.url, navigation: RootNavigation});
  };

  private sharedFileDataListener(item?: ShareData): void {
    if (!item || !item.data) {
      return;
    }

    // TODO currently on supporting one file
    const file = typeof item.data === 'string' ? item.data : item.data[0];

    readFile({filePath: file})
      .then(async (file: string) => {
        // Currently we only support receiving one credential, we are missing ui to display multiple
        const vc: VerifiableCredential = JSON.parse(file).credential?.data?.verifiableCredential[0];
        if (!vc) {
          showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('intent_share_file_unable_to_receive_message')});
          return;
        }

        // TODO fix the store not having the correct action types (should include ThunkAction)
        const storeCredential = async (vc: VerifiableCredential) => await store.dispatch<any>(storeVerifiableCredential(vc));

        // We navigate to the QR stack as this is the stack for incoming credentials
        RootNavigation.navigate(NavigationBarRoutesEnum.QR, {
          screen: ScreenRoutesEnum.CREDENTIAL_DETAILS,
          params: {
            rawCredential: vc,
            credential: await toNonPersistedCredentialSummary(vc),
            primaryAction: {
              caption: translate('action_accept_label'),
              onPress: async () =>
                storeCredential(vc)
                  .then(() =>
                    RootNavigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
                      screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
                    }),
                  )
                  .then(() => showToast(ToastTypeEnum.TOAST_SUCCESS, {message: translate('credential_offer_accepted_toast'), showBadge: false}))
                  .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, {message: error.message})),
            },
            secondaryAction: {
              caption: translate('action_decline_label'),
              onPress: async () =>
                RootNavigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
                  screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
                }),
            },
          },
        });
      })
      .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, {message: error.message}));
  }
}

export default IntentHandler;
