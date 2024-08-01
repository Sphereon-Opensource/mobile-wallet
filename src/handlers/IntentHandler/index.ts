import {emitLinkHandlerURLEvent} from '@sphereon/ssi-sdk.core';
import {VerifiableCredential} from '@veramo/core';
import Debug, {Debugger} from 'debug';
import {EmitterSubscription, Linking} from 'react-native';
import ShareMenu, {ShareData, ShareListener} from 'react-native-share-menu';
import {APP_ID} from '../../@config/constants';
import {agentContext} from '../../agent';
import {translate} from '../../localization/Localization';
import RootNavigation from '../../navigation/rootNavigation';
import {readFile} from '../../services/fileService';
import store from '../../store';
import {storeVerifiableCredential} from '../../store/actions/credential.actions';
import {NavigationBarRoutesEnum, ScreenRoutesEnum, ToastTypeEnum} from '../../types';
import {parseDeepLink, showToast} from '../../utils';
import {toNonPersistedCredentialSummary} from '@sphereon/ui-components.credential-branding';
import LockingHandler from '../LockingHandler';
import {CredentialRole} from '@sphereon/ssi-sdk.data-store';

const debug: Debugger = Debug(`${APP_ID}:IntentHandler`);

class IntentHandler {
  private static instance: IntentHandler;
  private deeplinkListener: EmitterSubscription;
  private shareListener: ShareListener;
  private _initialUrl?: string;
  private _enabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public isEnabled(): boolean {
    return this._enabled;
  }

  public enable = async (): Promise<void> => {
    debug(`Enable intent handler... `);
    if (this.isEnabled()) {
      debug('intent handler was already enabled');
    } else {
      this._enabled = true;
      try {
        debug(`intent handler was not enabled yet`);
        await this.handleLinksForStartingApp();
        await this.handleLinksForRunningApp();
      } catch (error) {
        console.log('Enable intent handler had an error:');
        console.log(JSON.stringify(error));
        this._enabled = false;
      }
      debug(`intent handler enabled`);
    }
  };

  public static getInstance(): IntentHandler {
    if (typeof IntentHandler.instance !== 'object') {
      IntentHandler.instance = new IntentHandler();
    }
    return IntentHandler.instance;
  }

  public disable = async (): Promise<void> => {
    this._enabled = false;

    // this._propagateEvents = false;
    this._initialUrl = undefined;
    try {
      await this.removeListeners();
    } catch (error) {
      console.log('Disable intent handler had an error:');
      console.log(JSON.stringify(error));
    }
  };

  private handleLinksForRunningApp = async (): Promise<void> => {
    /**
     * 1. If the app is already open, the app is foregrounded and a Linking event is fired
     * You can handle these events with Linking.addEventListener('url', callback).
     */
    if (!this.deeplinkListener) {
      this.deeplinkListener = Linking.addEventListener('url', this.deepLinkHandler);
    }
    if (!this.shareListener) {
      this.shareListener = ShareMenu.addNewShareListener(this.sharedFileDataAction);
    }
  };

  private removeListeners = async (): Promise<void> => {
    this.deeplinkListener?.remove();
    this.shareListener?.remove();
  };

  private async handleLinksForStartingApp(): Promise<void> {
    /**
     * 2. If the app is not already open, it is opened and the url is passed in as the initialURL
     * You can handle these events with Linking.getInitialURL() -- it returns a Promise that resolves to the url, if there is one.
     */
    await this.storeInitialURLOnStart();
    await this.handleSharedFileData();
  }

  private async storeInitialURLOnStart(): Promise<void> {
    const url: string | null = await Linking.getInitialURL();

    // Added expo-development-client check because of how the expo works in development
    if (!url || url.includes('expo-development-client')) {
      debug('No deeplink on start');
      return;
    }
    debug(`deeplink on start: ${url}`);
    this._initialUrl = url;
  }

  private async handleSharedFileData(): Promise<void> {
    ShareMenu.getSharedText((data?: ShareData): void => {
      if (!data || ((!data.data || data.data.length === 0) && !data.extraData)) {
        console.log('No shared data received');
        return;
      }
      console.log(`Receiving shared data: ${JSON.stringify(data, null, 2)}`);

      this.sharedFileDataAction(data);
    });
  }

  private deepLinkHandler = async (event: {url: string}): Promise<void> => {
    if (event.url) {
      debug(`Deeplink for running app: ${event.url}`);
      this._initialUrl = event.url;
    } else {
      debug(`No deeplink for running app. Event: ${JSON.stringify(event)}`);
    }
    this.openDeepLinkIfExistsAndAppUnlocked();
  };

  public openDeepLinkIfExistsAndAppUnlocked(): void {
    if (this.isEnabled() && this.hasDeepLink() && !LockingHandler.getInstance().isLocked) {
      void this.openDeepLink();
    } else {
      debug(`intent handler enabled: ${this.isEnabled()}, has deeplink: ${this.hasDeepLink()}, is locked: ${LockingHandler.getInstance().isLocked}`);
    }
  }

  public hasDeepLink = (): boolean => {
    const hasLink: boolean = !!this._initialUrl;
    return hasLink;
  };

  public getDeepLink(): string | undefined {
    debug(`get deeplink called. Value: (${this._initialUrl})`);
    return this._initialUrl;
  }

  public openDeepLink = async (): Promise<void> => {
    console.log(`Open deeplink for ${this._initialUrl}`);
    const url: string | undefined = this._initialUrl;
    this._initialUrl = undefined;
    if (url) {
      // TODO: create a deeplink parser/handler
      const queryParams = parseDeepLink(url).params;
      if ('error' in queryParams) {
        let message = queryParams.error;
        if ('error_description' in queryParams) {
          message += ': ' + queryParams.error_description;
        }
        throw new Error(message);
      }
      await emitLinkHandlerURLEvent({source: 'IntentHandler', url}, agentContext);
    }
  };

  private sharedFileDataAction(item?: ShareData): void {
    if (!item || !item.data) {
      return;
    }

    // TODO currently on supporting one file
    const file = typeof item.data === 'string' ? item.data : item.data[0];

    readFile({filePath: file})
      .then(async (file: string): Promise<void> => {
        // Currently we only support receiving one credential, we are missing ui to display multiple
        const vc: VerifiableCredential = JSON.parse(file).credential?.data?.verifiableCredential[0];
        if (!vc) {
          showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('intent_share_file_unable_to_receive_message')});
          return;
        }

        // TODO fix the store not having the correct action types (should include ThunkAction)
        const storeCredential = async (vc: VerifiableCredential): Promise<void> => await store.dispatch<any>(storeVerifiableCredential(vc));

        // We navigate to the QR stack as this is the stack for incoming credentials
        RootNavigation.navigate(NavigationBarRoutesEnum.QR, {
          screen: ScreenRoutesEnum.CREDENTIAL_DETAILS,
          params: {
            rawCredential: vc,
            credential: await toNonPersistedCredentialSummary({verifiableCredential: vc, credentialRole: CredentialRole.HOLDER}),
            primaryAction: {
              caption: translate('action_accept_label'),
              onPress: async (): Promise<void> =>
                storeCredential(vc)
                  .then(() =>
                    RootNavigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
                      screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
                    }),
                  )
                  .then(() =>
                    showToast(ToastTypeEnum.TOAST_SUCCESS, {
                      message: translate('credential_offer_accepted_toast'),
                      showBadge: false,
                    }),
                  )
                  .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, {message: error.message})),
            },
            secondaryAction: {
              caption: translate('action_decline_label'),
              onPress: async (): Promise<void> =>
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
