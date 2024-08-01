import React, {PureComponent} from 'react';
import {BackHandler, Keyboard, NativeEventSubscription, TouchableWithoutFeedback} from 'react-native';
import {connect} from 'react-redux';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Party, PartyOrigin, PartyTypeType} from '@sphereon/ssi-sdk.data-store';
import {agentContext} from '../../agent';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSICheckbox from '../../components/fields/SSICheckbox';
import SSITextInputField from '../../components/fields/SSITextInputField';
import {translate} from '../../localization/Localization';
import {getContacts} from '../../services/contactService';
import {updateContact as editContact, createContact as storeContact} from '../../store/actions/contact.actions';
import {showToast} from '../../utils';
import {CONTACT_ALIAS_MAX_LENGTH} from '../../@config/constants';
import {
  SSIContactAddScreenContainerStyled as Container,
  SSIContactAddScreenDisclaimerContainerStyled as DisclaimerContainer,
  SSIFullHeightScrollViewContainer as SSIScrollView,
  SSIStatusBarDarkModeStyled as StatusBar,
  SSIContactAddScreenTextInputContainerStyled as TextInputContainer,
} from '../../styles/components';
import {ICreateContactArgs, IUpdateContactArgs, MainRoutesEnum, RootState, ScreenRoutesEnum, StackParamList, ToastTypeEnum} from '../../types';
import {NavigationState} from '@react-navigation/routers';
import {navigationRef} from '../../navigation/rootNavigation';
import {Route} from '@react-navigation/native';

interface IProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_ADD> {
  createContact: (args: ICreateContactArgs) => Promise<Party>;
  updateContact: (args: IUpdateContactArgs) => Promise<Party>;
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
    // FIXME we should set the default name in the machine and pass that to the screen
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
    if (value.trim().length === 0) {
      this.setState({contactAlias: ''});
      return Promise.reject(Error(translate('contact_name_invalid_message')));
    }
  };

  onCreate = async (): Promise<void> => {
    const {onCreate} = this.props.route.params;
    const {contactAlias} = this.state;

    Keyboard.dismiss();

    this.onValidate(contactAlias)
      .then((): Promise<Party> => this.upsert())
      .then((contact: Party): Promise<void> => onCreate(contact))
      .catch((): void => {
        // do nothing as the state is already handled by the validate function, and we do not want to create the contact
        // we might want to do something with other errors
      });
  };

  private async upsert(): Promise<Party> {
    const {createContact, updateContact} = this.props;
    const {identities, name, uri} = this.props.route.params;
    const {contactAlias} = this.state;

    const contacts: Array<Party> = await getContacts(
      {
        filter: [
          {
            contact: {
              // Searching on legalName as displayName is not unique, and we only support organizations for now
              legalName: name,
            },
          },
        ],
      },
      agentContext,
    );
    if (contacts.length > 0 && contacts[0]?.contact!!) {
      contacts[0].contact.displayName = contactAlias;
      return updateContact({contact: contacts[0]});
    } else {
      return createContact({
        legalName: name,
        displayName: contactAlias.trim(),
        uri,
        identities,
        // FIXME maybe its nicer if we can also just use the id only
        // TODO using the predefined party type from the contact migrations here
        contactType: {
          id: '3875c12e-fdaa-4ef6-a340-c936e054b627',
          origin: PartyOrigin.EXTERNAL,
          type: PartyTypeType.ORGANIZATION,
          name: 'Sphereon_default_type',
          tenantId: '95e09cfc-c974-4174-86aa-7bf1d5251fb4',
        },
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
    const {navigation} = this.props;
    const {onDecline, onBack} = this.props.route.params;

    Keyboard.dismiss();

    navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('contact_add_cancel_title'),
      details: translate('contact_add_cancel_message'),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: onDecline,
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        // TODO WAL-541 fix navigation hierarchy
        // FIXME added another hack to determine which stack we are in so that we can navigate back from the popup screen
        onPress: async (): Promise<void> => {
          const rootState: NavigationState | undefined = navigationRef.current?.getRootState();
          if (!rootState?.routes) {
            return;
          }
          const mainStack = rootState.routes.find((route: Route<string>) => route.name === 'Main')?.state;
          if (!mainStack?.routes) {
            return;
          }
          if (mainStack.routes.some((route: any): boolean => route.name === 'SIOPV2')) {
            navigation.navigate(MainRoutesEnum.SIOPV2, {});
          } else if (mainStack.routes.some((route: any): boolean => route.name === 'OID4VCI')) {
            navigation.navigate(MainRoutesEnum.OID4VCI, {});
          }
        },
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
