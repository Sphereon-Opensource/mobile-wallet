import React, {FC, ReactElement} from 'react';
import {TouchableOpacity, View, ViewStyle} from 'react-native';
import {IImageAttributes, Party} from '@sphereon/ssi-sdk.data-store';
import {SSILogo as Logo, SSITextH7LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {
  RelyingPartyViewContainerStyled as Container,
  RelyingPartyViewContentContainerStyled as ContentContainer,
} from '../../../styles/components/components/RelyingPartyView';

// TODO move
export type Federation = {
  id: string;
  name: string;
  logo: IImageAttributes;
};

export type Props = {
  party: Party;
  style?: ViewStyle;
};

const RelyingPartyView: FC<Props> = (props: Props): ReactElement => {
  const {party, style} = props;

  //FIXME: currently just disabling the navigation, needs to be properly implemented
  //after submission
  // const onPress = async (party: Party): Promise<void> => {
  //   navigation.navigate(ScreenRoutesEnum.CONTACT_DETAILS, {contact: party});
  // };

  return (
    <Container isTrusted={true} style={{...style}}>
      <ContentContainer>
        <TouchableOpacity style={{height: 42, alignItems: 'center', flexDirection: 'row'}}>
          <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
            {party.branding && <Logo logo={party.branding.logo} size={22} />}
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <SSITextH7LightStyled>{party.contact.displayName}</SSITextH7LightStyled>
            </View>
          </View>
          {/* FIXME: currently just disabling the navigation, needs to be properly implemented
           * after submission */}
          {/* <View style={{height: 42, width: 42, marginLeft: 'auto', alignItems: 'center', justifyContent: 'center'}}>
            <ArrowIcon />
          </View> */}
        </TouchableOpacity>
      </ContentContainer>
    </Container>
  );
};

export default RelyingPartyView;
