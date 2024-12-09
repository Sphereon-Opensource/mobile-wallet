import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';
import {SSITextH2SemiBoldLightStyled, SSITextH4LightStyled} from '../../styles/components';
import ChevronIcon from '../assets/icons/ChevronIcon';
import {CredentialViewImage} from '../views/SSICredentialViewItem/CredentailViewImage';
import React, {useEffect, useState} from 'react';
import {CredentialDetailsRow, toCredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import SSIImageField from '../fields/SSIImageField';
import SSITextField from '../fields/SSITextField';
import { Info as InfoType } from '../../types';

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
  padding-right: 16px;
  padding-left: 16px;
  padding-bottom: 16px;
`;

const SharedInfoItemList = styled.View`
  flex: 1;
`;

const CredentialSummary = styled.View`
  justify-content: center;
  flex: 1;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${backgroundColors.primaryLight};
  opacity: 0.12;
`;

export type Props = {
  info: InfoType;
  header?: {
    title: string;
    description?: string;
    branding?: IBasicCredentialLocaleBranding;
  };
  onPress?: () => void;
  showValues?: boolean;
};

const Info = ({header, info, onPress, showValues = false}: Props) => {
  const [credentialContent, setCredentialContent] = useState<Array<CredentialDetailsRow>>([]);
  const itemsShared = Object.entries(info);
  const disabled = itemsShared.length === 0;

  useEffect(() => {
    toCredentialDetailsRow({
      object: info
    }).then((content) => setCredentialContent(content))
  }, [])

  return (
    <SharedInfoContainer style={{
      ...(!onPress && {flex: 1})
    }}>
      {header && (
        <>
          <SharedInfoHeader>
            {header.branding && <CredentialViewImage branding={header.branding} />}
            <CredentialSummary>
              <SSITextH2SemiBoldLightStyled>{header.title}</SSITextH2SemiBoldLightStyled>
              {header.description && <SSITextH4LightStyled style={{opacity: 0.8}}>{header.description}</SSITextH4LightStyled>}
            </CredentialSummary>
          </SharedInfoHeader>
          {!disabled &&
              <Divider />
          }
        </>
      )}
      {!disabled &&
          <SharedInfoBody
              style={{
                ...(onPress && {paddingTop: 16}),
                ...(!onPress && {flex: 1})
              }}
              onPress={onPress}
              disabled={disabled || !onPress}
              accessibilityState={{disabled}}
              accessibilityRole="list"
              accessibilityLabel="Shared information"
              accessibilityHint={disabled ? 'No information shared' : ''}
          >
            {!onPress &&
                <ScrollView>
                <SharedInfoItemList importantForAccessibility="no">
                  {credentialContent.map((property, idx) =>
                      property.imageSize ? (
                          <SSIImageField key={idx} item={property} />
                      ) : (
                          <SSITextField key={idx} item={property} />
                      ),
                  )}
                </SharedInfoItemList>
                </ScrollView>
            }
            {onPress && <ChevronIcon size={16} color={fontColors.light} style={{marginLeft: 'auto', transform: [{rotate: '-90deg'}]}} />}
          </SharedInfoBody>
      }
    </SharedInfoContainer>
  );
};

export default Info;
