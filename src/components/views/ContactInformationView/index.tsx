import {borderColors} from '@sphereon/ui-components.core';
import {View, ViewStyle} from 'react-native';
import {SSITextH3LightStyled} from '../../../styles/components';
import {ContactDetailsHeaderSection} from '../../../styles/components/components/ContactInformationView';
import {IButton} from '../../../types';
import {ContactDetailsView, IContactDetailsViewProps} from '../ContactDetailsView';
import {NewContactViewItem, NewContactViewItemProps} from '../NewContactViewItem';

export interface ContactInformationProps extends Omit<NewContactViewItemProps, 'background'>, IContactDetailsViewProps {
  primaryButton?: IButton;
  secondaryButton?: IButton;
  style?: ViewStyle;
}

export const ContactInformationView = (props: ContactInformationProps) => {
  const {name, logo, roles, status, properties, secondaryButton, primaryButton, style} = props;
  return (
    <View style={{...style, flex: 1}}>
      <ContactDetailsHeaderSection>
        <NewContactViewItem name={name} roles={roles} logo={logo} status={status} logoSize={60} />
      </ContactDetailsHeaderSection>
      <SSITextH3LightStyled style={{marginHorizontal: 24}} accessibilityRole="header">
        Details
      </SSITextH3LightStyled>
      <ContactDetailsView
        properties={properties}
        secondaryButton={secondaryButton}
        primaryButton={primaryButton}
        style={{
          borderTopColor: borderColors.dark,
          borderTopWidth: 1,
        }}
      />
    </View>
  );
};
