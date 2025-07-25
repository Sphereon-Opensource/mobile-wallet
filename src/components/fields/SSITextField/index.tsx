import React, {FC, ReactElement, ReactNode} from 'react';
import {Linking, Text, TouchableOpacity, View} from 'react-native';
import Markdown, {ASTNode} from 'react-native-markdown-display';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {SSIStatusLabel} from '@sphereon/ui-components.ssi-react-native';
import SSIEditIcon from '../../../components/assets/icons/SSIEditIcon';
import ClaimTrueIcon from '../../assets/icons/ClaimTrueIcon';
import ClaimFalseIcon from '../../assets/icons/ClaimFalseIcon';
import {checkAndAddHTTPPrefix, isValidURL} from '../../../utils';
import {fontStyle} from '../../../styles/typography';
import {
  SSITextFieldContainerStyled as Container,
  SSITextFieldContentBadgeContainerStyled as ContentBadgeContainer,
  SSITextFieldContentContainerStyled as ContentContainer,
  SSITextFieldEditBadgeContainerStyled as EditBadgeContainer,
  SSITextFieldHeaderContainerStyled as HeaderContainer,
  SSITextH5LightStyled as HeaderLabel,
  SSITextFieldStatusLabelContainerStyled as StatusLabelContainer,
} from '../../../styles/components';

export interface IProps {
  item: CredentialDetailsRow;
  index?: number;
}

const SSITextField: FC<IProps> = (props: IProps): ReactElement => {
  const {item, index} = props;
  const valueIsArray = Array.isArray(item.value);
  const markDownRules = {
    link: (node: ASTNode, children: Array<ReactNode>, parent: Array<ASTNode>, styles: any) => {
      return (
        <Text key={node.key} style={styles.link}>
          {children}
        </Text>
      );
    },
    image: (
      node: ASTNode,
      children: Array<ReactNode>,
      parent: Array<ASTNode>,
      styles: any,
      allowedImageHandlers: Array<string>,
      defaultImageHandler: string,
    ) => {
      return (
        <View key={node.key} style={styles.image}>
          {children}
        </View>
      );
    },
  };

  const onPressLink = async (url: string): Promise<void> => {
    const valueWithPrefix = checkAndAddHTTPPrefix(url);
    return Linking.canOpenURL(valueWithPrefix)
      .then((canOpen: boolean): void => {
        if (canOpen) {
          Linking.openURL(valueWithPrefix).catch(() => console.log(`Failed to open: ${url}`));
        }
      })
      .catch(() => console.log(`SSITextField: unable to open weblink ${url}`));
  };

  const getValueElements = (item: any): Array<ReactElement> => {
    const values = valueIsArray ? item : [item];
    return values.map((value: any, index: number) => {
      const validURL = isValidURL(value);
      const markdownStyle = {
        body: {
          fontFamily: fontStyle.h7SemiBold.fontFamily,
          fontSize: fontStyle.h7SemiBold.fontSize,
          fontWeight: fontStyle.h7SemiBold.fontWeight,
          color: fontColors.light,
        },
        code_inline: {
          backgroundColor: backgroundColors.primaryDark,
        },
        blockquote: {
          backgroundColor: backgroundColors.primaryDark,
        },
        code_block: {
          backgroundColor: backgroundColors.primaryDark,
        },
        // Overriding implicit margin on text
        // https://github.com/iamacup/react-native-markdown-display/blob/master/src/lib/styles.js#L174
        paragraph: {
          marginTop: 0,
          marginBottom: 0,
          ...(validURL && {textDecorationLine: 'underline'}),
        },
      };
      return (
        <TouchableOpacity
          key={index}
          accessibilityRole={validURL ? 'link' : 'text'}
          disabled={true}
          {...(validURL && {onPress: () => onPressLink(value), disabled: false})}>
          {typeof value === 'boolean' ? (
            value ? (
              <ClaimTrueIcon />
            ) : (
              <ClaimFalseIcon />
            )
          ) : (
            <Markdown rules={markDownRules} style={markdownStyle}>
              {
                value.toString() // to string as Markdown only supports strings and not numbers
              }
            </Markdown>
          )}
        </TouchableOpacity>
      );
    });
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
        style={{...(valueIsArray && {flexDirection: 'column', marginLeft: 25})}}
        {...(item.onPress && {onPress: item.onPress})}>
        {getValueElements(item.value)}
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
