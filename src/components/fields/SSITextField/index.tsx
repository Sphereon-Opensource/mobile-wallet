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

export interface IProps {
  item: CredentialDetailsRow;
  index?: number;
}

const SSITextField: FC<IProps> = (props: IProps): JSX.Element => {
  const {item, index} = props;

  const valueIsArray = Array.isArray(item.value);

  const validURL = useMemo(() => parseValidURL(item.value), [item.value]);

  const onPressLink = () => {
    if (!validURL) return;
    const valueWithPrefix = checkAndAddHTTPPrefix(item.value);
    return Linking.canOpenURL(valueWithPrefix)
      .then(canOpen => {
        if (canOpen) Linking.openURL(valueWithPrefix).catch(e => console.log('Failed to open: ' + item.value));
      })
      .catch(e => console.log('SSITextField: unable to open weblink ' + item.value));
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
        {valueIsArray && item.value.map((v: string) => <ContentText style={{marginLeft: 25}}>{v}</ContentText>)}
        {!valueIsArray && (
          <ContentText
            accessibilityRole={validURL ? 'link' : 'text'}
            onPress={onPressLink}
            style={{textDecorationLine: validURL ? 'underline' : 'none'}}>
            {item.value}
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
