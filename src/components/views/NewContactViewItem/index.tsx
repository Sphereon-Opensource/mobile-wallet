import {CredentialRole, IImageAttributes} from '@sphereon/ssi-sdk.data-store';
import {backgroundColors} from '@sphereon/ui-components.core';
import {useMemo} from 'react';
import {
  SSIContactViewItemContainerStyled as ContactDetailsHeaderContainer,
  SSIContactViewItemNewStatusContainerStyled as StatusContainer,
  SSIContactViewItemContactDetailsContainerStyled as ContactDetailsContainer,
  SSITextH3LightStyled as ContactNameCaption,
  SSITextH4LightStyled as ContactRolesCaption,
  SSIContactViewItemLogoContainerStyled as LogoContainer,
} from '../../../styles/components';
import {SSILogo as Logo} from '@sphereon/ui-components.ssi-react-native';
import {View} from 'react-native';
import {VerifiedLabel} from './components/VerifiedLabel';

type NewContactViewItemProps = {
  // contact: Party;
  name: string;
  uri?: string;
  logo?: IImageAttributes;
  roles: Array<CredentialRole>;
  verified?: boolean;
  background?: 'light' | 'dark';
};

export const NewContactViewItem = (props: NewContactViewItemProps) => {
  const {name, uri, roles, logo, verified = false, background = 'dark'} = props;
  const backgroundColor = useMemo(() => {
    return background === 'light' ? '#2C334B' : backgroundColors.primaryDark;
  }, [background]);
  return (
    <ContactDetailsHeaderContainer style={{backgroundColor, paddingLeft: 0}}>
      <StatusContainer />
      <LogoContainer>
        <Logo logo={logo} size={55} />
      </LogoContainer>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <ContactDetailsContainer>
          <ContactNameCaption>{name}</ContactNameCaption>
          <ContactRolesCaption>{roles.join(', ')}</ContactRolesCaption>
        </ContactDetailsContainer>
        {verified && <VerifiedLabel />}
        {/* <ContactUriCaption>{uri}</ContactUriCaption> */}
      </View>
    </ContactDetailsHeaderContainer>
  );
};
