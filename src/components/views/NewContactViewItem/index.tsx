import {CredentialRole} from '@sphereon/ssi-sdk.data-store';
import {backgroundColors, ImageAttributes} from '@sphereon/ui-components.core';
import {useMemo} from 'react';
import {
  SSIContactViewItemContactDetailsContainerStyled as ContactDetailsContainer,
  SSITextH3LightStyled as ContactNameCaption,
  SSITextH4LightStyled as ContactRolesCaption,
} from '../../../styles/components';
import {
  NewContactViewItemContainer as Container,
  NewContactViewItemLogoContainer,
  NewContactViewItemNameCaption,
  NewContactViewItemRolesCaption,
} from '../../../styles/components/components/NewContactViewItem';
import {SSILogo as Logo} from '@sphereon/ui-components.ssi-react-native';
import {StyleProp, View, ViewStyle} from 'react-native';
import {VerifiedLabel} from '../../../components/assets/badges/VerifiedLabel';

export type NewContactViewItemProps = {
  name: string;
  logo?: ImageAttributes;
  roles?: Array<CredentialRole>;
  verified?: boolean;
  background?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
  logoSize?: number;
};

export const NewContactViewItem = (props: NewContactViewItemProps) => {
  const {name, roles, logo, verified = false, background = 'dark', logoSize = 55, style} = props;
  const backgroundColor = useMemo(() => {
    return background === 'light' ? '#2C334B' : backgroundColors.primaryDark;
  }, [background]);
  return (
    <Container style={[{backgroundColor, paddingLeft: 0, gap: 15}, style]}>
      <NewContactViewItemLogoContainer style={{display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
        <Logo logo={logo} size={logoSize} />
      </NewContactViewItemLogoContainer>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <ContactDetailsContainer>
          <NewContactViewItemNameCaption>{name}</NewContactViewItemNameCaption>
          {(roles?.length ?? 0) > 0 && <NewContactViewItemRolesCaption>{roles?.join(', ')}</NewContactViewItemRolesCaption>}
        </ContactDetailsContainer>
        {verified && <VerifiedLabel />}
      </View>
    </Container>
  );
};
