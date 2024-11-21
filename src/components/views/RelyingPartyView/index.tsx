import React, {FC, ReactElement} from 'react';
import {TouchableOpacity, View, ViewStyle} from 'react-native';
import {IImageAttributes, Party} from '@sphereon/ssi-sdk.data-store';
import {SSILogo as Logo, SSITextH7LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {
  RelyingPartyViewContainerStyled as Container,
  RelyingPartyViewContentContainerStyled as ContentContainer,
} from '../../../styles/components/components/RelyingPartyView';
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
  party: Party;
  style?: ViewStyle;
};

const RelyingPartyView: FC<Props> = (props: Props): ReactElement => {
  const {party, style} = props;
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  const onPress = async (party: Party): Promise<void> => {
    navigation.navigate(ScreenRoutesEnum.CONTACT_DETAILS, {contact: party});
  };

  return (
    <Container isTrusted={true} style={{...style}}>
      <ContentContainer>
        <TouchableOpacity style={{height: 42, alignItems: 'center', flexDirection: 'row'}} onPress={() => onPress(party)}>
          <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
            {party.branding && <Logo logo={party.branding.logo} size={22} />}
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <SSITextH7LightStyled>{party.contact.displayName}</SSITextH7LightStyled>
            </View>
          </View>
          <View style={{height: 42, width: 42, marginLeft: 'auto', alignItems: 'center', justifyContent: 'center'}}>
            <ArrowIcon />
          </View>
        </TouchableOpacity>
      </ContentContainer>
    </Container>
  );
};

export default RelyingPartyView;
