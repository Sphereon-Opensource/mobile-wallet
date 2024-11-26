import {Party} from '@sphereon/ssi-sdk.data-store';
import {SSILogo as Logo, SSITextH7LightStyled} from '@sphereon/ui-components.ssi-react-native';
import React, {FC, ReactElement} from 'react';
import {TouchableOpacity, View, ViewStyle} from 'react-native';
import {
  RelyingPartyViewContainerStyled as Container,
  RelyingPartyViewContentContainerStyled as ContentContainer,
} from '../../../styles/components/components/RelyingPartyView';
import ArrowIcon from '../../assets/icons/ArrowIcon';

export type Props = {
  party: Party;
  style?: ViewStyle;
  onPress?: () => Promise<void>
};

const RelyingPartyView: FC<Props> = (props: Props): ReactElement => {
  const {onPress, party, style} = props;

  return (
    <Container isTrusted={true} style={{...style}}>
      <ContentContainer>
        <TouchableOpacity  onPress={onPress} style={{height: 42, alignItems: 'center', flexDirection: 'row'}}>
          <View style={{flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1}}>
            <Logo logo={party.branding?.logo} size={22} />
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1}}>
              <SSITextH7LightStyled numberOfLines={2}>{party.contact.displayName}</SSITextH7LightStyled>
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
