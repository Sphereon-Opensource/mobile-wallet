import React, {FC, ReactElement} from 'react';
import {TouchableOpacity, View, ViewStyle} from 'react-native';
import ShieldIcon from '../../assets/icons/ShieldIcon';
import Localization from '../../../localization/Localization';
import {IImageAttributes, Party} from '@sphereon/ssi-sdk.data-store';
import {SSICheckmarkBadge, SSILogo as Logo, SSITextH7LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {
  FederationTrustViewContainerStyled as Container,
  FederationTrustViewIconContainerStyled as IconContainer,
  FederationTrustViewContentContainerStyled as ContentContainer,
  FederationTrustViewHeaderContainerStyled as HeaderContainer,
  FederationTrustViewTitleTextStyled as TitleText,
  FederationTrustViewDescriptionTextStyled as DescriptionText,
} from '../../../styles/components/components/FederationTrustView';
import ArrowIcon from '../../assets/icons/ArrowIcon';
import {ScreenRoutesEnum, StackParamList} from '../../../types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

// TODO move
export type Federation = {
  id: string;
  name: string;
  logo: IImageAttributes;
};

export type Props = {
  partyName: string;
  federations?: Array<Party>;
  style?: ViewStyle;
};

const FederationTrustView: FC<Props> = (props: Props): ReactElement => {
  const {partyName, federations = [], style} = props;
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const isTrusted = federations.length > 0;

  const onPress = async (federation: Party): Promise<void> => {
    navigation.navigate(ScreenRoutesEnum.CONTACT_DETAILS, {contact: federation});
  };

  // TODO should be it's own component later
  const getTrustedFederationElements = (): Array<ReactElement> => {
    return federations.map((federation, index) => (
      <TouchableOpacity key={index} style={{height: 42, alignItems: 'center', flexDirection: 'row'}} onPress={() => onPress(federation)}>
        <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
          {federation.branding && <Logo logo={federation.branding.logo} size={22} />}
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <SSITextH7LightStyled>{federation.contact.displayName}</SSITextH7LightStyled>
            <SSICheckmarkBadge />
          </View>
        </View>
        <View style={{height: 42, width: 42, marginLeft: 'auto', alignItems: 'center', justifyContent: 'center'}}>
          <ArrowIcon />
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <Container isTrusted={isTrusted} style={{...style}}>
      <IconContainer>
        <ShieldIcon isProtected={isTrusted} color={isTrusted ? '#B1EBC9' : '#E7C9BB'} />
      </IconContainer>
      <ContentContainer>
        <HeaderContainer>
          <TitleText isTrusted={isTrusted}>
            {Localization.translate(isTrusted ? 'federation_view_trusted_title' : 'federation_view_untrusted_title', {partyName})}
          </TitleText>
          <DescriptionText isTrusted={isTrusted}>
            {Localization.translate(isTrusted ? 'federation_view_trusted_description' : 'federation_view_untrusted_description')}
          </DescriptionText>
        </HeaderContainer>
        {isTrusted && <View>{getTrustedFederationElements()}</View>}
      </ContentContainer>
    </Container>
  );
};

export default FederationTrustView;
