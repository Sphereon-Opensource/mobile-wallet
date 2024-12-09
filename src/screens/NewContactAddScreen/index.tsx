import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Party, PartyOrigin, PartyTypeType} from '@sphereon/ssi-sdk.data-store';
import React, {FC, ReactElement, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {CONTACT_ALIAS_MAX_LENGTH} from '../../@config/constants';
import {agentContext} from '../../agent';
import {ContactInformationView} from '../../components/views/ContactInformationView';
import FederationTrustView from '../../components/views/FederationTrustView';
import Localization, {translate} from '../../localization/Localization';
import {getContacts} from '../../services/contactService';
import {createContact, fetchBrandingForContact, updateContact} from '../../store/actions/contact.actions';
import {SSIBasicContainerStyled as Container} from '../../styles/components';
import {MainRoutesEnum, RootState, ScreenRoutesEnum, StackParamList} from '../../types';
import {Chat} from '../../components/chat/Chat';
import {stringifyState} from '../../utils/stringifyState';
import {useChat} from '../../providers/chat/chatProvider';
type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.NEW_CONTACT_ADD>;

const NewContactAddScreen: FC<Props> = (props: Props): ReactElement => {
  const {
    name,
    uri,
    roles,
    logo,
    description,
    clientUri,
    tosUri,
    policyUri,
    contacts,
    identities,
    federations,
    onCreate,
    onContinue,
    onDecline,
    onAliasChange,
    isCreateDisabled,
    onBack,
  } = props.route.params;
  const dispatch = useDispatch();
  const contactState = useSelector((state: RootState) => state.contact);
  const [brandedFederations, setBrandedFederations] = useState<Array<Party> | undefined>();
  const contactAliasRef = useRef(name);

  const {closeModal} = useChat();

  const onBackPress = (): boolean => {
    if (onBack) {
      void onBack();
      // make sure event stops here
      return true;
    }

    // FIXME for some reason returning false does not execute default behaviour
    props.navigation.goBack();
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [onBackPress]),
  );

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

  const onUpdateContactAliasRef = useCallback(async (value: string): Promise<void> => {
    contactAliasRef.current = value;
  }, []);

  const onContactAliasChange = useCallback((): void => {
    void onAliasChange?.(contactAliasRef.current);
    props.navigation.setParams({name: contactAliasRef.current});
  }, []);

  const onValidate = async (value: string): Promise<void> => {
    if (value.trim().length === 0) {
      contactAliasRef.current = '';
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
      contacts[0].contact.displayName = contactAliasRef.current;
      return dispatch<any>(updateContact({contact: contacts[0]}));
    } else {
      return dispatch<any>(
        createContact({
          legalName: name,
          displayName: contactAliasRef.current.trim(),
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

  const onContinuePressed = async (): Promise<void> => {
    const onPress = async (): Promise<void> => {
      if (onCreate) {
        onValidate(contactAliasRef.current)
          .then((): Promise<Party> => upsert())
          .then((contact: Party): Promise<void> => onCreate(contact))
          .catch((): void => {
            // do nothing as the state is already handled by the validate function, and we do not want to create the contact
            // we might want to do something with other errors
          });
      } else if (onContinue) {
        void onContinue();
      }
    };

    if (federations !== undefined && federations.length === 0) {
      props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
        title: translate('new_contact_add_new_contact_low_level_trust_title'),
        details: translate('new_contact_add_new_contact_low_level_trust_description'),
        primaryButton: {
          caption: translate('new_contact_add_new_contact_continue_caption'),
          onPress: onPress,
        },
        secondaryButton: {
          caption: translate('new_contact_add_new_contact_abort_caption'),
          onPress: onDecline,
        },
      });
    } else {
      void onPress();
    }
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
    return contactAliasRef.current === undefined || contactAliasRef.current.trim().length === 0 || contactState.loading;
  };

  const onEditAlias = async (): Promise<void> => {
    props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('new_contact_add_new_contact_create_title'),
      details: translate('new_contact_add_new_contact_create_description'),
      input: {
        label: translate('contact_name_label'),
        initialValue: contactAliasRef.current,
        placeHolder: translate('contact_name_placeholder'),
        maxLength: CONTACT_ALIAS_MAX_LENGTH,
        onValueChange: onUpdateContactAliasRef,
      },
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: async (): Promise<void> => {
          void onContactAliasChange();
          props.navigation.getParent()?.goBack();
        },
        disabled: isConfirmDisabled,
        accessibilityLabel: translate('contact_name_label'),
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async (): Promise<void> => {
          contactAliasRef.current = name;
          props.navigation.getParent()?.goBack();
        },
      },
    });
  };

  const tools = useMemo(
    () => [
      {
        tool: {
          name: 'accept',
          description: 'accept and add the contact',
          parameters: {},
        },
        callback: () => {
          void onContinuePressed();
          closeModal();
        },
      },
      {
        tool: {
          name: 'decline',
          description: 'decline, abort or skip adding the contact',
          parameters: {},
        },
        callback: () => {
          void onDeclinePressed();
          closeModal();
        },
      },
      {
        tool: {
          name: 'editAlias',
          description: 'edit alias. Change the name of the contact',
          parameters: {},
        },
        callback: () => {
          contactAliasRef.current
          void onEditAlias();
        }
      },
    ],
    [],
  );
  const screenContext = useMemo(
    () =>
      `you are currently on the Contact Review screen. Here you can see information about the contact related to the credential you are adding.
      ${federations?.length === 0
        ? "It looks like this contact is not part of any trusted federations. This is a low trust level contact. You can still add this contact, but explicitly and clearly inform the user about it before even listing the contact information. If the user is okay with this, you can proceed with listing the details."
        : `This contact is part of the following federations ${federations?.map(f => f.contact.displayName)?.join(', ')}. This is a high trust level contact. You can proceed with listing the details.`
      }
      Communicate contact details, trust level and possible actions. contact: ${contactState} screen props: ${stringifyState(
        {name, uri, roles, logo, description, clientUri, tosUri, policyUri, identities, federations},
      )}`,
    [contactState, name, uri, roles, logo, description, clientUri, tosUri, policyUri, identities, federations],
  );

  return (
    <Container>
      {brandedFederations && (
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
            value: contactAliasRef.current,
            ...(onAliasChange && {isEditable: true}),
            ...(onAliasChange && {onPress: onEditAlias}),
          },
          ...(clientUri
            ? [
                {
                  id: '3',
                  label: Localization.translate('new_contact_add_new_contact_contact_details_website_label'),
                  value: clientUri,
                },
              ]
            : []),
          ...(tosUri
            ? [
                {
                  id: '4',
                  label: Localization.translate('new_contact_add_new_contact_contact_details_tos_label'),
                  value: tosUri,
                },
              ]
            : []),
          ...(policyUri
            ? [
                {
                  id: '5',
                  label: Localization.translate('new_contact_add_new_contact_contact_details_policy_label'),
                  value: policyUri,
                },
              ]
            : []),
          ...(contacts
            ? [
                {
                  id: '6',
                  label: Localization.translate('new_contact_add_new_contact_contact_details_contacts_label'),
                  value: contacts,
                },
              ]
            : []),
        ]}
        primaryButton={{
          caption: translate('new_contact_add_new_contact_continue_caption'),
          onPress: onContinuePressed,
          disabled: isCreateDisabled,
        }}
        secondaryButton={{
          caption: translate('action_abort_label'),
          onPress: onDeclinePressed,
        }}
        logo={logo}
      />
      <Chat
          screenContext={screenContext}
          tools={tools}
      />
    </Container>
  );
};

export default NewContactAddScreen;
