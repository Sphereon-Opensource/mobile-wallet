import React, {FC, useMemo} from 'react';
import {fontColors} from '@sphereon/ui-components.core';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {SSIStatusLabel} from '@sphereon/ui-components.ssi-react-native';
import {Linking} from 'react-native';
import SSIEditIcon from '../../../components/assets/icons/SSIEditIcon';
import {checkAndAddHTTPPrefix, parseValidURL} from '../../../utils';
import {
  SSITextFieldContainerStyled as Container,
  SSITextFieldContentBadgeContainerStyled as ContentBadgeContainer,
  SSITextFieldContentContainerStyled as ContentContainer,
  SSITextH7SemiBoldLightStyled as ContentText,
  SSITextFieldEditBadgeContainerStyled as EditBadgeContainer,
  SSITextFieldHeaderContainerStyled as HeaderContainer,
  SSITextH5LightStyled as HeaderLabel,
  SSITextFieldStatusLabelContainerStyled as StatusLabelContainer,
} from '../../../styles/components';
import ClaimTrueIcon from '../../assets/icons/ClaimTrueIcon'
import ClaimFalseIcon from '../../assets/icons/ClaimFalseIcon'

export interface IProps {
  item: CredentialDetailsRow;
  index?: number;
}

const SSITextField: FC<IProps> = (props: IProps): JSX.Element => {
  const {item, index} = props;
  const valueIsArray = Array.isArray(item.value);
  const validURL = useMemo(() => parseValidURL(item.value), [item.value]);

  const onPressLink = (url: string) => {
    const valueWithPrefix = checkAndAddHTTPPrefix(url);
    return Linking.canOpenURL(valueWithPrefix)
    .then(canOpen => {
      if (canOpen) Linking.openURL(valueWithPrefix).catch(e => console.log('Failed to open: ' + url));
    })
    .catch(e => console.log('SSITextField: unable to open weblink ' + url));
  };

  return (
    <Container key={item.id} style={{marginTop: index === 0 ? 16 : 10}}>
      <HeaderContainer>
        <HeaderLabel>{item.label}</HeaderLabel>
        {item.status && (
          <StatusLabelContainer>
            <SSIStatusLabel status={item.status} showIcon />
          </StatusLabelContainer>
        )}
      </HeaderContainer>
      {/* This forces every field to be a touchable, hence making accessibility misleading */}
      <ContentContainer
        disabled={!item.isEditable}
        style={{...(valueIsArray && {flexDirection: 'column'})}}
        {...(item.onPress && {onPress: item.onPress})}>
        {valueIsArray && item.value.map((v: string, index: number) => {
          const validURL = parseValidURL(v)
          return <ContentText onPress={() => onPressLink(v)} accessibilityRole={validURL ? 'link' : 'text'} key={index} style={{textDecorationLine: validURL ? 'underline' : 'none', marginLeft: 25}}>{v}</ContentText>
        })}
        {!valueIsArray && (
          <ContentText
            accessibilityRole={validURL ? 'link' : 'text'}
            {...(validURL && {onPress: () => onPressLink(item.value)})}
            style={{textDecorationLine: validURL ? 'underline' : 'none'}}>
            { typeof item.value === 'boolean'
              ? item.value ? <ClaimTrueIcon /> : <ClaimFalseIcon />
              : item.value
            }
          </ContentText>
        )}
        <ContentBadgeContainer>
          {item.isEditable && (
            <EditBadgeContainer>
              <SSIEditIcon color={fontColors.light} />
            </EditBadgeContainer>
          )}
        </ContentBadgeContainer>
      </ContentContainer>
    </Container>
  );
};

export default SSITextField;
