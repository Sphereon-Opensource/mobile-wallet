import React, {PureComponent} from 'react';
import {BackHandler, Keyboard, NativeEventSubscription, TouchableWithoutFeedback} from 'react-native';
import {connect} from 'react-redux';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {IContact} from '@sphereon/ssi-sdk.data-store';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSICheckbox from '../../components/fields/SSICheckbox';
import SSITextInputField from '../../components/fields/SSITextInputField';
import {translate} from '../../localization/Localization';
import {getContacts} from '../../services/contactService';
import {updateContact as editContact, createContact as storeContact} from '../../store/actions/contact.actions';
import {showToast} from '../../utils/ToastUtils';
import {CONTACT_ALIAS_MAX_LENGTH} from '../../@config/constants';
import {
  SSIContactAddScreenContainerStyled as Container,
  SSIContactAddScreenDisclaimerContainerStyled as DisclaimerContainer,
  SSIFullHeightScrollViewContainer as SSIScrollView,
  SSIStatusBarDarkModeStyled as StatusBar,
  SSIContactAddScreenTextInputContainerStyled as TextInputContainer,
} from '../../styles/components';
import {ICreateContactArgs, IUpdateContactArgs, MainRoutesEnum, RootState, ScreenRoutesEnum, StackParamList, ToastTypeEnum} from '../../types';

interface IProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_ADD> {
  createContact: (args: ICreateContactArgs) => Promise<IContact>;
  updateContact: (args: IUpdateContactArgs) => Promise<IContact>;
  loading: boolean;
}

interface IState {
  contactAlias: string;
  hasConsent: boolean;
}

class SSIContactAddScreen extends PureComponent<IProps, IState> {
  hardwareBackPressListener: NativeEventSubscription;
  state: IState = {
    contactAlias: this.props.route.params.name ?? '',
    hasConsent: this.props.route.params.hasConsent ?? true,
  };

  componentDidMount(): void {
    const {onAliasChange} = this.props.route.params;
    this.hardwareBackPressListener = BackHandler.addEventListener('hardwareBackPress', this.onBack);
    if (onAliasChange) {
      void onAliasChange(this.state.contactAlias);
    }
  }

  onBack = (): boolean => {
    const {navigation} = this.props;
    const {onBack} = this.props.route.params;
    if (onBack) {
      void onBack();
      // make sure event stops here
      return true;
    }

    // FIXME for some reason returning false does not execute default behaviour
    navigation.goBack();
    return true;
  };

  onValidate = async (value: string): Promise<void> => {
    let contactAlias: string = value.trim();

    if (contactAlias.length === 0) {
      this.setState({contactAlias: ''});
      return Promise.reject(Error(translate('contact_name_invalid_message')));
    }

    const contacts: Array<IContact> = await getContacts({filter: [{alias: contactAlias}]});
    if (contacts.length !== 0) {
      this.setState({contactAlias: ''});
      return Promise.reject(Error(translate('contact_name_unavailable_message')));
    }
  };

  onCreate = async (): Promise<void> => {
    const {onCreate} = this.props.route.params;
    const {contactAlias} = this.state;

    Keyboard.dismiss();

    this.onValidate(contactAlias)
      .then((): Promise<IContact> => this.upsert())
      .then((contact: IContact): Promise<void> => onCreate(contact))
      .catch((): void => {
        // do nothing as the state is already handled by the validate function, and we do not want to create the contact
        // we might want to do something with other errors
      });
  };

  private async upsert(): Promise<IContact> {
    const {createContact, updateContact} = this.props;
    const {identities, name, uri} = this.props.route.params;
    const {contactAlias} = this.state;

    const contacts: Array<IContact> = await getContacts({filter: [{name: name}]});
    if (contacts.length !== 0) {
      const contactToUpdate: IUpdateContactArgs = {contact: contacts[0]};
      contactToUpdate.contact.alias = contactAlias;
      return updateContact(contactToUpdate);
    } else {
      return createContact({
        name,
        alias: contactAlias.trim(),
        uri,
        identities,
      });
    }
  }

  onAliasChange = async (alias: string): Promise<void> => {
    const {onAliasChange} = this.props.route.params;
    this.setState({contactAlias: alias});
    if (onAliasChange) {
      await onAliasChange(alias);
    }
  };

  onConsentChange = async (isChecked: boolean): Promise<void> => {
    const {onConsentChange} = this.props.route.params;
    this.setState({hasConsent: isChecked});
    if (onConsentChange) {
      await onConsentChange(isChecked);
    }
    if (!isChecked) {
      showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('contact_add_no_consent_toast')});
    }
  };

  onDecline = async (): Promise<void> => {
    const {onDecline} = this.props.route.params;

    Keyboard.dismiss();

    this.props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('contact_add_cancel_title'),
      details: translate('contact_add_cancel_message'),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: onDecline,
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        // TODO WAL-541 fix navigation hierarchy
        onPress: async (): Promise<void> => this.props.navigation.navigate(MainRoutesEnum.HOME, {}),
      },
    });
  };

  render(): JSX.Element {
    const {loading} = this.props;
    const {isCreateDisabled} = this.props.route.params;
    const {contactAlias, hasConsent} = this.state;

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Container>
          <SSIScrollView>
            <StatusBar />
            <TextInputContainer>
              <SSITextInputField
                autoFocus={true}
                label={translate('contact_name_label')}
                maxLength={CONTACT_ALIAS_MAX_LENGTH}
                onChangeText={this.onAliasChange}
                onEndEditing={this.onValidate}
                placeholderValue={translate('contact_name_placeholder')}
                initialValue={contactAlias}
              />
            </TextInputContainer>
            <DisclaimerContainer>
              <SSICheckbox initialValue={hasConsent} label={translate('contact_add_disclaimer')} onValueChange={this.onConsentChange} />
            </DisclaimerContainer>
            <SSIButtonsContainer
              secondaryButton={{
                caption: translate('action_decline_label'),
                onPress: this.onDecline,
              }}
              primaryButton={{
                caption: translate('action_accept_label'),
                disabled: isCreateDisabled || loading,
                onPress: this.onCreate,
              }}
            />
          </SSIScrollView>
        </Container>
      </TouchableWithoutFeedback>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    createContact: (args: ICreateContactArgs) => dispatch(storeContact(args)),
    updateContact: (args: IUpdateContactArgs) => dispatch(editContact(args)),
  };
};

const mapStateToProps = (state: RootState) => {
  return {
    loading: state.contact.loading,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SSIContactAddScreen);
