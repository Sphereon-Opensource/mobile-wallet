import {CredentialRole} from '@sphereon/ssi-sdk.data-store';
import {backgroundColors, ImageAttributes, LabelStatus} from '@sphereon/ui-components.core';
import {SSILogo as Logo, SSIStatusLabel} from '@sphereon/ui-components.ssi-react-native';
import {useMemo} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils';
import {SSIContactViewItemContactDetailsContainerStyled as ContactDetailsContainer} from '../../../styles/components';
import {
  NewContactViewItemContainer as Container,
  NewContactViewItemLogoContainer,
  NewContactViewItemNameCaption,
  NewContactViewItemRolesCaption,
} from '../../../styles/components/components/NewContactViewItem';

export type NewContactViewItemProps = {
  name: string;
  logo?: ImageAttributes;
  roles?: Array<CredentialRole>;
  background?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
  logoSize?: number;
  status?: LabelStatus;
  containerProps?: Omit<ViewProps, 'style'>;
};

export const NewContactViewItem = (props: NewContactViewItemProps) => {
  const {name, roles, logo, status, background = 'dark', logoSize = 55, style} = props;
  const backgroundColor = useMemo(() => {
    return background === 'light' ? '#2C334B' : backgroundColors.primaryDark;
  }, [background]);
  return (
    <Container style={[{backgroundColor, paddingLeft: 0, gap: 16}, style]} {...props.containerProps}>
      <NewContactViewItemLogoContainer
        importantForAccessibility={props.containerProps?.accessible ? 'no-hide-descendants' : 'auto'}
        accessibilityRole="image"
        accessibilityLabel={`${name} logo`}
        style={{display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
        <Logo logo={logo} size={logoSize} />
      </NewContactViewItemLogoContainer>
      <View importantForAccessibility={props.containerProps?.accessible ? 'no-hide-descendants' : 'auto'} style={{flex: 1, justifyContent: 'center'}}>
        <ContactDetailsContainer>
          <NewContactViewItemNameCaption>{name}</NewContactViewItemNameCaption>
          {(roles?.length ?? 0) > 0 && (
            <NewContactViewItemRolesCaption accessibilityLabel={`Roles: ${roles?.join(', ')}`}>{roles?.join(', ')}</NewContactViewItemRolesCaption>
          )}
        </ContactDetailsContainer>
        {status && (
          <View accessible accessibilityLabel={`Contact status: ${status}`}>
            <SSIStatusLabel status={status} showIcon />
          </View>
        )}
      </View>
    </Container>
  );
};
