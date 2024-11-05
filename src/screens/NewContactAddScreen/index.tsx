import React, {FC, ReactElement, useEffect, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SSIBasicContainerStyled as Container} from '../../styles/components';
import {MainRoutesEnum, RootState, ScreenRoutesEnum, StackParamList} from '../../types';
import FederationTrustView from '../../components/views/FederationTrustView';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {ContactInformationView} from '../../components/views/ContactInformationView';
import {Party, PartyOrigin, PartyTypeType} from '@sphereon/ssi-sdk.data-store';
import {translate} from '../../localization/Localization';
import {getContacts} from '../../services/contactService';
import {agentContext} from '../../agent';
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';
import {CONTACT_ALIAS_MAX_LENGTH} from '../../@config/constants';
import {createContact, updateContact} from '../../store/actions/contact.actions';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.NEW_CONTACT_ADD>;

const NewContactAddScreen: FC<Props> = (props: Props): ReactElement => {
  const {name, uri, roles, identities, federations, onCreate, onDecline, onAliasChange, isCreateDisabled} = props.route.params;
  const [contactAlias, setContactAlias] = useState(name);
  const dispatch = useDispatch();
  const contactState = useSelector((state: RootState) => state.contact);

  useEffect((): void => {
    // FIXME we should set the default name in the machine and pass that to the screen
    if (onAliasChange) {
      void onAliasChange(name);
    }
  }, []);

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
        onValueChange: async value => setContactAlias(value),
      },
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: onCreatePressed,
        disabled: isCreateDisabled || contactState.loading,
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
        <FederationTrustView partyName={name} federations={federations} style={{marginTop: 12, marginBottom: 24, marginRight: 24, marginLeft: 24}} />
      )}
      <ContactInformationView
        contact={{
          id: '96ef563c-419d-464f-a0f1-9fe1c46767b7',
          uri: 'example.com',
          roles: [],
          identities: [],
          electronicAddresses: [],
          physicalAddresses: [],
          relationships: [],
          partyType: {
            id: 'cf7e12c8-f5d4-44f2-8027-7cd0de54da28',
            type: PartyTypeType.NATURAL_PERSON,
            origin: PartyOrigin.EXTERNAL,
            name: 'example_name',
            tenantId: '0605761c-4113-4ce5-a6b2-9cbae2f9d289',
            createdAt: new Date(),
            lastUpdatedAt: new Date(),
          },
          contact: {
            id: '37bb6e0f-2fb6-4940-babc-8d26baa0e842',
            firstName: 'example_first_name',
            middleName: 'example_middle_name',
            lastName: 'example_last_name',
            displayName: 'example_display_name',
            metadata: [],
            createdAt: new Date(),
            lastUpdatedAt: new Date(),
          },
          createdAt: new Date(),
          lastUpdatedAt: new Date(),
        }}
      />
      <View style={{paddingTop: 36, paddingBottom: 36, paddingLeft: 24, paddingRight: 24, marginTop: 'auto', gap: 12}}>
        <PrimaryButton caption={translate('new_contact_add_new_contact_continue_caption')} onPress={onContinuePressed} />
        <SecondaryButton caption={translate('action_abort_label')} onPress={onDeclinePressed} />
      </View>
    </Container>
  );
};

export default NewContactAddScreen;
