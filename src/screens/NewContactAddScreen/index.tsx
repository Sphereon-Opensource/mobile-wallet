import React, {FC, ReactElement, useEffect, useState} from 'react';
import {BackHandler, Keyboard} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SSIBasicContainerStyled as Container} from '../../styles/components';
import {MainRoutesEnum, RootState, ScreenRoutesEnum, StackParamList} from '../../types';
import FederationTrustView from '../../components/views/FederationTrustView';
import {ContactInformationView} from '../../components/views/ContactInformationView';
import {Party, PartyOrigin, PartyTypeType} from '@sphereon/ssi-sdk.data-store';
import Localization, {translate} from '../../localization/Localization';
import {getContacts} from '../../services/contactService';
import {agentContext} from '../../agent';
import {useDispatch, useSelector} from 'react-redux';
import {CONTACT_ALIAS_MAX_LENGTH} from '../../@config/constants';
import {createContact, fetchBrandingForContact, updateContact} from '../../store/actions/contact.actions';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.NEW_CONTACT_ADD>;

const NewContactAddScreen: FC<Props> = (props: Props): ReactElement => {
  const {name, uri, roles, description, clientUri, tosUri, policyUri, identities, federations, onCreate, onDecline, onAliasChange, isCreateDisabled} =
    props.route.params;
  const [contactAlias, setContactAlias] = useState(name);
  const dispatch = useDispatch();
  const contactState = useSelector((state: RootState) => state.contact);
  const [brandedFederations, setBrandedFederations] = useState<Array<Party>>([]);

  useEffect((): void => {
    if (!federations) {
      return;
    }
    const branded = federations.map(federation => fetchBrandingForContact(federation));
    Promise.all(branded).then(result => setBrandedFederations(result));
  }, []);

  useEffect((): void => {
    // FIXME we should set the default name in the machine and pass that to the screen
    void onAliasChange?.(name);
  }, []);

  const onBack = (): boolean => {
    if (onBack) {
      void onBack();
      // make sure event stops here
      return true;
    }

    // FIXME for some reason returning false does not execute default behaviour
    props.navigation.goBack();
    return true;
  };

  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', onBack);
  //   return () => backHandler.remove();
  // }, []);

  const onValidate = async (value: string): Promise<void> => {
    if (value.trim().length === 0) {
      setContactAlias('');
      return Promise.reject(Error(translate('contact_name_invalid_message')));
    }
  };

  const upsert = async (): Promise<Party> => {
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
      return dispatch<any>(updateContact({contact: contacts[0]}));
    } else {
      return dispatch<any>(
        createContact({
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
        }),
      );
    }
  };

  const onCreatePressed = async (): Promise<void> => {
    Keyboard.dismiss();
    onValidate(contactAlias)
      .then((): Promise<Party> => upsert())
      .then((contact: Party): Promise<void> => onCreate(contact))
      .catch((): void => {
        // do nothing as the state is already handled by the validate function, and we do not want to create the contact
        // we might want to do something with other errors
      });
  };

  const onDeclinePressed = async (): Promise<void> => {
    props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('new_contact_add_new_contact_abort_title'),
      details: translate('new_contact_add_new_contact_abort_description', {partyName: name}),
      primaryButton: {
        caption: translate('new_contact_add_new_contact_abort_continue_caption'),
        onPress: onDecline,
      },
      secondaryButton: {
        caption: translate('new_contact_add_new_contact_abort_cancel_caption'),
        onPress: async (): Promise<void> => props.navigation.getParent()?.goBack(),
      },
    });
  };

  const isConfirmDisabled = (): boolean => {
    return contactAlias === undefined || contactAlias.length === 0 || contactState.loading;
  };

  const onContinuePressed = async (): Promise<void> => {
    props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('new_contact_add_new_contact_create_title'),
      details: translate('new_contact_add_new_contact_create_description'),
      input: {
        label: translate('contact_name_label'),
        initialValue: contactAlias,
        placeHolder: translate('contact_name_placeholder'),
        maxLength: CONTACT_ALIAS_MAX_LENGTH,
        onEndEditing: async value => onValidate(value),
        onValueChange: async value => {
          setContactAlias(value);
          void onAliasChange?.(value);
        },
      },
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: onCreatePressed,
        disabled: isCreateDisabled || contactState.loading, //isConfirmDisabled//!contactAlias || contactAlias.length === 0 || contactState.loading, ////isCreateDisabled
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async (): Promise<void> => props.navigation.getParent()?.goBack(),
      },
    });
  };

  return (
    <Container>
      {federations !== undefined && (
        <FederationTrustView
          partyName={name}
          federations={brandedFederations}
          style={{marginTop: 12, marginBottom: 24, marginRight: 24, marginLeft: 24}}
        />
      )}
      <ContactInformationView
        name={name}
        roles={roles}
        properties={[
          ...(description
            ? [
                {
                  id: '1',
                  label: Localization.translate('new_contact_add_new_contact_contact_details_description_label'),
                  value: description,
                },
              ]
            : []),
          {
            id: '2',
            label: Localization.translate('new_contact_add_new_contact_contact_details_name_label'),
            value: name,
            isEditable: true,
          },
          ...(clientUri
            ? [
                {
                  id: '1',
                  label: Localization.translate('new_contact_add_new_contact_contact_details_website_label'),
                  value: clientUri,
                },
              ]
            : []),
          ...(tosUri
            ? [
                {
                  id: '1',
                  label: Localization.translate('new_contact_add_new_contact_contact_details_tos_label'),
                  value: tosUri,
                },
              ]
            : []),
          ...(policyUri
            ? [
                {
                  id: '1',
                  label: Localization.translate('new_contact_add_new_contact_contact_details_policy_label'),
                  value: policyUri,
                },
              ]
            : []),
        ]}
        primaryButton={{
          caption: translate('new_contact_add_new_contact_continue_caption'),
          onPress: onContinuePressed,
        }}
        secondaryButton={{
          caption: translate('action_abort_label'),
          onPress: onDeclinePressed,
        }}
        // logo={}
      />
    </Container>
  );
};

export default NewContactAddScreen;
