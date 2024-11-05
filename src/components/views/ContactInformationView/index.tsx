import {StyleProp, View, ViewStyle} from 'react-native';
import {ContactDetailsHeaderSection} from '../../../styles/components/components/ContactInformationView';
import {ITabViewRoute} from '../../../types';
import {translate} from '../../../localization/Localization';
import SSITabView from '../../../components/views/SSITabView';
import {NewContactViewItem, NewContactViewItemProps} from '../NewContactViewItem';
import {ContactDetailsView, IContactDetailsViewProps} from '../ContactDetailsView';

export interface ContactInformationProps extends Omit<NewContactViewItemProps, 'background'>, IContactDetailsViewProps {
  style?: StyleProp<ViewStyle>;
}

export const ContactInformationView = (props: ContactInformationProps) => {
  const {name, logo, roles, verified, properties, style} = props;

  const routes: Array<ITabViewRoute> = [
    {
      key: 'Details',
      title: translate('contact_details_info_tab_header_label'),
      content: () => <ContactDetailsView properties={properties} />,
    },
  ];
  return (
    <View style={[{flex: 1}, style]}>
      <ContactDetailsHeaderSection>
        <NewContactViewItem name={name} roles={roles} logo={logo} verified={verified} logoSize={60} />
      </ContactDetailsHeaderSection>
      <SSITabView routes={routes} />
    </View>
  );
};
