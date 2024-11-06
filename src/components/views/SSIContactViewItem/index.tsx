import {CredentialRole, IImageAttributes} from '@sphereon/ssi-sdk.data-store';
import React, {FC} from 'react';
import {View} from 'react-native';

import {
  SSIContactViewItemContactDetailsContainerStyled as ContactDetailsContainer,
  SSITextH3LightStyled as ContactNameCaption,
  SSITextH4LightStyled as ContactRolesCaption,
  SSIContactViewItemContactUriCaptionStyled as ContactUriCaption,
  SSIContactViewItemContainerStyled as Container,
  SSIContactViewItemLogoContainerStyled as LogoContainer,
  SSIContactViewItemNewStatusContainerStyled as StatusContainer,
} from '../../../styles/components';
import Debug, {Debugger} from 'debug';
import {APP_ID} from '../../../@config/constants';
import {SSILogo as Logo} from '@sphereon/ui-components.ssi-react-native';
import styled from 'styled-components/native';
import SSIBackIcon from '../../../components/assets/icons/SSIBackIcon';
import {transform} from 'typescript';

const debug: Debugger = Debug(`${APP_ID}:SSIContactViewItem`);

export interface Props {
  name: string;
  uri?: string;
  logo?: IImageAttributes;
  roles: Array<CredentialRole>;
  showArrow?: boolean;
}

const ChevronRight = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 5px;
`;

const SSIContactViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {name, uri, roles, logo, showArrow = false} = props;
  debug(`logo: ${logo ? JSON.stringify(logo) : ''}`);
  return (
    <Container>
      <StatusContainer />
      <LogoContainer>
        <Logo logo={logo} />
      </LogoContainer>
      <View style={{flex: 1}}>
        <ContactDetailsContainer>
          <ContactNameCaption>{name}</ContactNameCaption>
          <ContactRolesCaption>{roles.join(', ')}</ContactRolesCaption>
        </ContactDetailsContainer>
        <ContactUriCaption>{uri}</ContactUriCaption>
      </View>
      {showArrow && (
        <ChevronRight>
          <SSIBackIcon
            color="white"
            style={{
              transform: [
                {
                  rotate: '180deg',
                },
              ],
            }}
          />
        </ChevronRight>
      )}
    </Container>
  );
};

export default SSIContactViewItem;
