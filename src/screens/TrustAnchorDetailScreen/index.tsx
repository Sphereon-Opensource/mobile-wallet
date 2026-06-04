import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Party} from '@sphereon/ssi-sdk.data-store-types';
import React, {FC, useEffect} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {backgroundColors} from '@sphereon/ui-components.core';
import {SSITextH3LightStyled, SSITextH5LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {SSIBasicContainerStyled as Container} from '../../styles/components';
import {translate} from '../../localization/Localization';
import {getContacts} from '../../store/actions/contact.actions';
import {getTrustAnchorLinks} from '../../store/actions/trustAnchor.actions';
import {RootState, ScreenRoutesEnum, StackParamList} from '../../types';
import {ITrustAnchorContactLink} from '../../types/store/trustAnchor.types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.TRUST_ANCHOR_DETAILS>;

const Row: FC<{children: React.ReactNode}> = ({children}) => <View style={{paddingHorizontal: 24, paddingVertical: 8}}>{children}</View>;

const TrustAnchorDetailScreen: FC<Props> = (props: Props): JSX.Element => {
  const {trustAnchor} = props.route.params;
  const dispatch = useDispatch();
  const {links} = useSelector((state: RootState) => state.trustAnchor);
  const {contacts} = useSelector((state: RootState) => state.contact);

  useEffect(() => {
    dispatch<any>(getTrustAnchorLinks());
    dispatch<any>(getContacts());
  }, [dispatch]);

  // Only links for this anchor that still resolve to an existing contact (filters out orphans).
  const linkedContacts: Array<{link: ITrustAnchorContactLink; contact: Party}> = links
    .filter((link: ITrustAnchorContactLink) => link.trustAnchorId === trustAnchor.id)
    .map((link: ITrustAnchorContactLink) => ({link, contact: contacts.find((c: Party) => c.id === link.contactId)}))
    .filter((entry): entry is {link: ITrustAnchorContactLink; contact: Party} => entry.contact !== undefined);

  const expired = trustAnchor.notAfter ? new Date(trustAnchor.notAfter).getTime() < Date.now() : false;

  return (
    <Container>
      <ScrollView style={{flex: 1}}>
        <Row>
          <SSITextH3LightStyled accessibilityRole="header">{trustAnchor.label}</SSITextH3LightStyled>
          <SSITextH5LightStyled style={{opacity: 0.7, marginTop: 4}}>
            {trustAnchor.type.toUpperCase()} · {trustAnchor.trustMode}
          </SSITextH5LightStyled>
          {trustAnchor.subjectDN ? (
            <SSITextH5LightStyled style={{opacity: 0.7, marginTop: 2}} numberOfLines={2}>
              {trustAnchor.subjectDN}
            </SSITextH5LightStyled>
          ) : null}
          {trustAnchor.notAfter ? (
            <SSITextH5LightStyled style={{opacity: 0.7, marginTop: 2}}>
              {translate('trust_anchor_valid_until_label')}: {new Date(trustAnchor.notAfter).toLocaleDateString()}
              {expired ? ` (${translate('trust_anchor_expired_label')})` : ''}
            </SSITextH5LightStyled>
          ) : null}
        </Row>

        <Row>
          <SSITextH3LightStyled accessibilityRole="header">{translate('trust_anchor_linked_contacts_label')}</SSITextH3LightStyled>
        </Row>
        {linkedContacts.length === 0 ? (
          <Row>
            <SSITextH5LightStyled style={{opacity: 0.7}}>{translate('trust_anchor_linked_contacts_empty')}</SSITextH5LightStyled>
          </Row>
        ) : (
          linkedContacts.map(({link, contact}, idx) => (
            <TouchableOpacity
              key={link.id}
              accessibilityRole="button"
              onPress={() => props.navigation.navigate(ScreenRoutesEnum.CONTACT_DETAILS, {contact})}
              style={{
                backgroundColor: idx % 2 === 0 ? backgroundColors.secondaryDark : backgroundColors.primaryDark,
                paddingHorizontal: 24,
                paddingVertical: 14,
              }}>
              <SSITextH5LightStyled>{contact.contact.displayName}</SSITextH5LightStyled>
              {link.matchedValue ? (
                <SSITextH5LightStyled style={{opacity: 0.6, marginTop: 2}} numberOfLines={1}>
                  {link.matchedValue}
                </SSITextH5LightStyled>
              ) : null}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </Container>
  );
};

export default TrustAnchorDetailScreen;
