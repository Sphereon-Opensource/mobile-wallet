import {ICredential} from "@sphereon/ssi-types";
import {ProofType, UnsignedCredential, VerifiableCredential} from "@veramo/core";
import * as RNFS from 'react-native-fs';
import ShareMenuModule from 'react-native-share-menu';

import {NavigationBarRoutesEnum, ScreenRoutesEnum} from "../../@types";
import {SharedItem} from "../../@types/files";
import {translate} from "../../localization/Localization";
import * as RootNavigation from '../../navigation/rootNavigation'
import store from "../../store";
import {storeVerifiableCredential} from "../../store/actions/credential.actions";
import {showToast, ToastTypeEnum} from "../../utils/ToastUtils";
import {toCredentialSummary} from "../../utils/mappers/CredentialMapper";

class SharedDataProvider {

  public static async getDataOnStartup() {
    await ShareMenuModule.getSharedText((data: any) => {
      SharedDataProvider.receiveData(data);
    });
  }



  private static onDecline() {
    return async () => RootNavigation.navigate(NavigationBarRoutesEnum.HOME, {
      screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW
    });
  }

  private static onAcceptance(storeCredential: (vc: VerifiableCredential) => Promise<void>, vc: UnsignedCredential & { proof: ProofType }) {
    return async () =>
        storeCredential(vc)
        .then(() =>
            RootNavigation.navigate(NavigationBarRoutesEnum.HOME, {
              screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW
            })
        )
        .then(() => showToast(ToastTypeEnum.TOAST_SUCCESS, translate('credential_offer_accepted_toast')))
        .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, error.message));
  }

  public static async receiveData(item: SharedItem) {
    if (item) {
      RNFS.readFile(item.data)
      .then((fileString: string) => {
        console.log(`file contents : ${fileString}`);
        const vc: VerifiableCredential = JSON.parse(fileString)?.credential?.data?.verifiableCredential[0];
        if (vc) {
          const storeCredential = async (vc: VerifiableCredential) => {
            await store.dispatch(storeVerifiableCredential(vc));
          }

          const params = {
            vc,
            credential: toCredentialSummary(vc as ICredential),
            primaryAction: {
              caption: translate('action_accept_label'),
              onPress: this.onAcceptance(storeCredential, vc)
            },
            secondaryAction: {
              caption: translate('action_decline_label'),
              onPress: this.onDecline()
            }
          };
          console.log('navigating to the Credential Details Screen.')
          RootNavigation.navigate(NavigationBarRoutesEnum.HOME, {
            screen: ScreenRoutesEnum.CREDENTIAL_DETAILS,
            params: params
          })
        }
      });
    }

  }
}

export default SharedDataProvider
