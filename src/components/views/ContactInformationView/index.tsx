import {StyleProp, View, ViewStyle} from 'react-native';
import {ContactDetailsHeaderSection} from '../../../styles/components/components/ContactInformationView';
import {IButton, ITabViewRoute} from '../../../types';
import {translate} from '../../../localization/Localization';
import SSITabView from '../../../components/views/SSITabView';
import {NewContactViewItem, NewContactViewItemProps} from '../NewContactViewItem';
import {ContactDetailsView, IContactDetailsViewProps} from '../ContactDetailsView';

export interface ContactInformationProps extends Omit<NewContactViewItemProps, 'background'>, IContactDetailsViewProps {
  primaryButton?: IButton;
  secondaryButton?: IButton;
  style?: ViewStyle;
}

export const ContactInformationView = (props: ContactInformationProps) => {
  const {name, logo, roles, status, properties, secondaryButton, primaryButton, style} = props;

  const routes: Array<ITabViewRoute> = [
    {
      key: 'Details',
      title: translate('contact_details_info_tab_header_label'),
      content: () => <ContactDetailsView properties={properties} secondaryButton={secondaryButton} primaryButton={primaryButton} />,
    },
  ];
  return (
    <View style={{...style, flex: 1}}>
      <ContactDetailsHeaderSection>
        <NewContactViewItem name={name} roles={roles} logo={logo} status={status} logoSize={60} />
      </ContactDetailsHeaderSection>
      <SSITabView routes={routes} />
    </View>
  );
};
