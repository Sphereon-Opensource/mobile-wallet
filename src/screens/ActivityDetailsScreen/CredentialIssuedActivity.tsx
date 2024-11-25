import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImageAttributes, toLocalDateString} from '@sphereon/ui-components.core';
import {CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import {SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import {View, useWindowDimensions} from 'react-native';
import {NavigationButton} from '../../components/NavigationButton';
import Info from '../../components/activity/Info';
import {Section} from '../../components/activity/Section';
import Status from '../../components/activity/Status';
import {useAppSelector} from '../../hooks/useStore';
import {translate} from '../../localization/Localization';
import {ActivityIssueType, ICredentialIssuedActivity, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ACTIVITY_DETAILS> & {
  activity: ICredentialIssuedActivity<ActivityIssueType>;
};

const getCredentialCardLogo = (credential: CredentialSummary): ImageAttributes | undefined => {
  if (credential.branding?.logo?.uri || credential.branding?.logo?.dataUri) {
    return credential.branding.logo;
  }

  const uri: string | undefined = getIssuerLogo(credential, credential.branding);
  if (uri) {
    return {uri};
  }
};

const CARD_WIDTH = 330;
const PARENT_CONTAINER_TOTAL_PADDING_HORIZONTAL = 32;

const CredentialIssuedActivity = ({activity, navigation}: Props) => {
  const contacts = useAppSelector(state => state.contact.contacts);
  const {info, contactAlias, credential} = activity;
  const contact = contacts.find(c => c.contact.displayName === contactAlias);
  const screenWidth = useWindowDimensions().width;
  const scale = (screenWidth - PARENT_CONTAINER_TOTAL_PADDING_HORIZONTAL) / CARD_WIDTH;
  return (
    <>
      {credential && (
        <View
          accessible
          accessibilityLabel={`${credential.title}. Issued by: ${credential.issuer.alias}, on: ${toLocalDateString(
            credential.issueDate,
          )}. Expires on: ${toLocalDateString(credential.expirationDate)}. Status: ${credential.credentialStatus}`}
          style={{
            marginHorizontal: 'auto',
            marginVertical: 16,
            transform: [{scale}],
          }}>
          <SSICredentialCardView
            header={{
              credentialTitle: credential.branding?.alias,
              credentialSubtitle: credential.branding?.description ?? 'Personal Identification Data', // FIXME Funke
              logo: getCredentialCardLogo(credential),
            }}
            body={{
              issuerName: credential.issuer.alias,
            }}
            footer={{
              credentialStatus: getCredentialStatus(credential),
              expirationDate: credential.expirationDate,
            }}
            display={{
              backgroundColor: credential.branding?.background?.color,
              backgroundImage: credential.branding?.background?.image,
              textColor: credential.branding?.text?.color,
            }}
          />
        </View>
      )}
      <Section title={translate('activity.section_titles.issued_information')}>
        <Info info={info} onPress={() => navigation.push(ScreenRoutesEnum.ACTIVITY_REVEALED_INFO, {activity})} />
      </Section>
      <Section title={translate('activity.section_titles.status')}>
        <Status activity={activity} />
      </Section>
      {contact && (
        <NavigationButton
          label={`${translate('activity.contact_link')} ${contactAlias}`}
          onPress={() => navigation.navigate(ScreenRoutesEnum.CONTACT_DETAILS, {contact})}
          disabled={!contact}
        />
      )}
    </>
  );
};
export default CredentialIssuedActivity;
