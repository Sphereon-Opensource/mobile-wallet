import {NativeStackScreenProps} from '@react-navigation/native-stack';
import NavigationButton from '../../components/buttons/NavigationButton';
import Info from '../../components/activity/Info';
import {Section, SectionText} from '../../components/activity/Section';
import Status from '../../components/activity/Status';
import {useAppSelector} from '../../hooks/useStore';
import {translate} from '../../localization/Localization';
import {ActivityShareType, IContactCredentialsShareActivity, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ACTIVITY_DETAILS> & {
  activity: IContactCredentialsShareActivity<ActivityShareType>;
};

const ContactCredentialShareActivity = ({activity, navigation}: Props) => {
  const contacts = useAppSelector(state => state.contact.contacts);
  const {contactAlias, shared, purpose, credentialType} = activity;
  const contact = contacts.find(c => c.contact.displayName === contactAlias);
  return (
    <>
      {shared.map(({info, credential}) => (
        <Info
          key={JSON.stringify(info)}
          info={info}
          header={{
            title: credential?.branding?.alias ?? credential?.title ?? translate('activity.unknown.credential'),
            description: `${Object.keys(info).length} ${translate(`activity.${activity.action}.info_header.description`)}`,
            branding: credential?.branding,
          }}
          onPress={() => navigation.push(ScreenRoutesEnum.ACTIVITY_REVEALED_INFO, {activity})}
        />
      ))}
      <Section title={translate('activity.section_titles.status')}>
        <Status activity={activity} />
      </Section>
      <Section title={translate('activity.section_titles.purpose')}>
        <SectionText>{purpose}</SectionText>
      </Section>
      <Section title={translate('activity.section_titles.credential_type')}>
        <SectionText>{credentialType ?? translate('activity.unknown.credential_type')}</SectionText>
      </Section>
      <NavigationButton
        label={`${translate('activity.contact_link')} ${contactAlias}`}
        onPress={() => contact && navigation.push(ScreenRoutesEnum.CONTACT_DETAILS, {contact})}
        disabled={!contact}
      />
    </>
  );
};

export default ContactCredentialShareActivity;
