import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {SSITextH2SemiBoldLightStyled, SSITextH3RegularLightStyled, SSITextH4LightStyled} from '../../styles/components';
import ChevronIcon from '../assets/icons/ChevronIcon';
import {CredentialViewImage} from '../views/SSICredentialViewItem/CredentailViewImage';

const SharedInfoContainer = styled.View`
  background-color: ${backgroundColors.secondaryDark};
  border-radius: 8px;
`;

const SharedInfoHeader = styled.View`
  padding: 16px;
  flex-direction: row;
  gap: 12px;
`;

const SharedInfoBody = styled.TouchableOpacity`
  flex-direction: row;
  padding: 16px;
  gap: 16px;
  align-items: center;
`;

const SharedInfoItemList = styled.View`
  flex: 1;
`;

const SharedInfoItemKey = styled(SSITextH4LightStyled)`
  opacity: 0.8;
`;

const SharedInfoItemValue = styled(SSITextH3RegularLightStyled)``;

const CredentialSumary = styled.View`
  justify-content: center;
  flex: 1;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${backgroundColors.primaryLight};
  opacity: 0.12;
`;

export type Props = {
  info: Record<string, string | number>;
  header?: {
    title: string;
    description?: string;
    branding?: IBasicCredentialLocaleBranding;
  };
  onPress?: () => void;
  showValues?: boolean;
};

const Info = ({header, info, onPress, showValues = false}: Props) => {
  const itemsShared = Object.entries(info);
  return (
    <SharedInfoContainer>
      {header && (
        <>
          <SharedInfoHeader>
            {header.branding && <CredentialViewImage branding={header.branding} />}
            <CredentialSumary>
              <SSITextH2SemiBoldLightStyled>{header.title}</SSITextH2SemiBoldLightStyled>
              {header.description && <SSITextH4LightStyled style={{opacity: 0.8}}>{header.description}</SSITextH4LightStyled>}
            </CredentialSumary>
          </SharedInfoHeader>
          <Divider />
        </>
      )}
      <SharedInfoBody onPress={onPress} disabled={!onPress}>
        <SharedInfoItemList style={{gap: showValues ? 24 : 12}}>
          {itemsShared.map(([key, value]) => (
            <View key={key}>
              <SharedInfoItemKey>{key}</SharedInfoItemKey>
              {showValues && <SharedInfoItemValue>{value}</SharedInfoItemValue>}
            </View>
          ))}
        </SharedInfoItemList>
        {onPress && <ChevronIcon size={16} color={fontColors.light} style={{transform: [{rotate: '-90deg'}]}} />}
      </SharedInfoBody>
    </SharedInfoContainer>
  );
};

export default Info;
