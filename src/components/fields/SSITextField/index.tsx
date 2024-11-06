import React, {FC, useMemo} from 'react';

import SSIEditIcon from '../../../components/assets/icons/SSIEditIcon';
import {
  SSITextFieldContainerStyled as Container,
  SSITextFieldContentBadgeContainerStyled as ContentBadgeContainer,
  SSIFlexDirectionRowViewStyled as ContentContainer,
  SSITextFieldContentTextStyled as ContentText,
  SSITextFieldEditBadgeContainerStyled as EditBadgeContainer,
  SSITextFieldHeaderContainerStyled as HeaderContainer,
  SSITextH5LightStyled as HeaderLabel,
  SSITextFieldStatusLabelContainerStyled as StatusLabelContainer,
} from '../../../styles/components';
import {SSIStatusLabel} from '@sphereon/ui-components.ssi-react-native';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {Linking} from 'react-native';
import {checkAndAddHTTPPrefix, parseValidURL} from 'src/utils';

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
      <ContentContainer style={valueIsArray ? {flexDirection: 'column'} : undefined}>
        <ContentBadgeContainer>
          {item.isEditable && (
            <EditBadgeContainer>
              <SSIEditIcon />
            </EditBadgeContainer>
          )}
        </ContentBadgeContainer>
        {valueIsArray && item.value.map((v: string) => <ContentText style={{marginLeft: 25}}>{v}</ContentText>)}
        {!valueIsArray && (
          <ContentText onPress={onPressLink} style={{textDecorationLine: validURL ? 'underline' : 'none'}}>
            {item.value}
          </ContentText>
        )}
      </ContentContainer>
    </Container>
  );
};

export default SSITextField;
