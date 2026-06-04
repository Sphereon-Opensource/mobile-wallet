import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CredentialRole} from '@sphereon/ssi-types';
import {IssuerStatus} from '@sphereon/ui-components.core';
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import NavigationButton from '../../components/buttons/NavigationButton';
import {ContactInformationView} from '../../components/views/ContactInformationView';
import {useAccessibility} from '../../hooks/useAccessibility';
import {translate} from '../../localization/Localization';
import {ContactDetailsNavigationSection, Container, Divider} from '../../styles/components/screens/SSIContactDetailsScreen';
import {getTrustAnchorLinks, getTrustAnchors} from '../../store/actions/trustAnchor.actions';
import {MainRoutesEnum, NavigationBarRoutesEnum, RootState, ScreenRoutesEnum, StackParamList} from '../../types';
import {ITrustAnchor, ITrustAnchorContactLink} from '../../types/store/trustAnchor.types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_DETAILS>;

const SSIContactDetailsScreen = ({route, navigation}: Props) => {
  const {contact} = route.params;
  const {announce} = useAccessibility();
  const dispatch = useDispatch();
  const activeUser = useSelector((state: RootState) => state.user.activeUser);
  const {links, trustAnchors} = useSelector((state: RootState) => state.trustAnchor);
  const isHolder = contact.id === activeUser?.id;

  useEffect(() => {
    dispatch<any>(getTrustAnchorLinks());
    dispatch<any>(getTrustAnchors());
  }, [dispatch]);

  // Trust anchors that vouch for this contact (link resolves to a still-existing anchor).
  const linkedAnchors: Array<ITrustAnchor> = links
    .filter((link: ITrustAnchorContactLink) => link.contactId === contact.id)
    .map((link: ITrustAnchorContactLink) => trustAnchors.find((a: ITrustAnchor) => a.id === link.trustAnchorId))
    .filter((anchor): anchor is ITrustAnchor => anchor !== undefined);
  const contactDetails = [
    {
      id: 'Name',
      label: 'Name',
      value: contact.contact.displayName,
    },
    {
      id: 'alias',
      label: 'Alias name',
      value: contact.branding?.alias,
    },
    {
      id: 'website',
      label: 'Website',
      value: contact.branding?.clientUri,
    },
    {
      id: 'description',
      label: 'Description',
      value: contact.branding?.description,
    },
    {
      id: 'tos_url',
      label: 'Terms of Service',
      value: contact.branding?.tosUri,
    },
    {
      id: 'privacy_url',
      label: 'Privacy Policy',
      value: contact.branding?.policyUri,
    },
    {
      id: 'contacts',
      label: 'Contacts',
      value: contact.branding?.contacts,
    },
  ];
  useFocusEffect(() => announce({message: `Contact details for ${contact.contact.displayName}`, delay: 1000}));
  return (
    <Container style={{paddingTop: 24}}>
      <ContactInformationView
        properties={contactDetails}
        name={contact.contact.displayName}
        roles={contact.roles}
        logo={contact.branding?.logo}
        style={{marginTop: 10}}
        status={IssuerStatus.VERIFIED}
        isHolder={isHolder}
      />
      <ContactDetailsNavigationSection>
        <NavigationButton label="Identities" onPress={() => navigation.push(ScreenRoutesEnum.CONTACT_IDENTITIES, {identities: contact.identities})} />
        <Divider />
        <NavigationButton
          label="Contact Activities"
          onPress={() => {
            if (contact.roles.includes(CredentialRole.HOLDER)) {
              navigation.getParent()?.navigate(MainRoutesEnum.HOME, {
                screen: NavigationBarRoutesEnum.ACTIVITIES,
              });
            } else {
              navigation.push(ScreenRoutesEnum.CONTACT_ACTIVITY, {contact});
            }
          }}
        />
        {linkedAnchors.map((anchor: ITrustAnchor) => (
          <React.Fragment key={anchor.id}>
            <Divider />
            <NavigationButton
              label={`${translate('trust_anchor_contact_section_label')}: ${anchor.label}`}
              onPress={() => navigation.push(ScreenRoutesEnum.TRUST_ANCHOR_DETAILS, {trustAnchor: anchor})}
            />
          </React.Fragment>
        ))}
      </ContactDetailsNavigationSection>
    </Container>
  );
};

export default SSIContactDetailsScreen;
