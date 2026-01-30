import React, {FC, ReactElement, ReactNode} from 'react';
import {Linking, Pressable, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Markdown, {ASTNode} from 'react-native-markdown-display';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {SSIStatusLabel} from '@sphereon/ui-components.ssi-react-native';
import SSIEditIcon from '../../../components/assets/icons/SSIEditIcon';
import ClaimTrueIcon from '../../assets/icons/ClaimTrueIcon';
import ClaimFalseIcon from '../../assets/icons/ClaimFalseIcon';
import {checkAndAddHTTPPrefix, isValidURL} from '../../../utils';
import {translate} from '../../../localization/Localization';
import {MainRoutesEnum} from '../../../types';
import {useUserPreference} from '../../../hooks/useUserPreference';
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
  valuesVisible?: boolean;
  onToggleVisibility?: () => void;
}

const SSITextField: FC<IProps> = (props: IProps): ReactElement => {
  const {item, index, valuesVisible = true, onToggleVisibility} = props;
  const navigation = useNavigation<any>();
  const warnOnExternalLink = useUserPreference('warnOnExternalLink') ?? true;
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

  const openLink = async (url: string): Promise<void> => {
    const valueWithPrefix = checkAndAddHTTPPrefix(url);
    return Linking.canOpenURL(valueWithPrefix)
      .then((canOpen: boolean): void => {
        if (canOpen) {
          Linking.openURL(valueWithPrefix).catch(() => console.log(`Failed to open: ${url}`));
        }
      })
      .catch(() => console.log(`SSITextField: unable to open weblink ${url}`));
  };

  const onPressLink = async (url: string): Promise<void> => {
    if (!warnOnExternalLink) {
      return openLink(url);
    }
    navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('credential_details_open_link_warning_title'),
      details: translate('credential_details_open_link_warning_description'),
      primaryButton: {
        caption: translate('credential_details_open_link_warning_proceed'),
        onPress: async () => openLink(url),
      },
      secondaryButton: {
        caption: translate('credential_details_open_link_warning_cancel'),
        onPress: async () => undefined,
      },
    });
  };

  const getValueElements = (item: any): Array<ReactElement> => {
    const values = valueIsArray ? item : [item];
    return values.map((value: any, index: number) => {
      const validURL = typeof value === 'string' && isValidURL(value); // compiler is allowing function with string parameter to be called with any? had to add the typeof
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

  const depthIndent = (item.depth ?? 0) * 16;

  return (
    <Pressable key={item.id} onLongPress={onToggleVisibility}>
    <Container style={{marginTop: index === 0 ? 16 : 10, marginLeft: depthIndent}}>
      <HeaderContainer>
        <HeaderLabel>{item.label}</HeaderLabel>
        {item.status && (
          <StatusLabelContainer>
            <SSIStatusLabel status={item.status} showIcon />
          </StatusLabelContainer>
        )}
      </HeaderContainer>
      {/* This forces every field to be a touchable, hence making accessibility misleading */}
      {item.value !== undefined && item.value !== null && <ContentContainer
        disabled={!item.isEditable || !valuesVisible}
        style={{...(valueIsArray && {flexDirection: 'column', marginLeft: 25})}}
        {...(valuesVisible && item.onPress && {onPress: item.onPress})}>
        <View style={{position: 'relative', overflow: 'hidden', borderRadius: 4}}>
          {getValueElements(item.value)}
          {!valuesVisible && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: backgroundColors.secondaryDark,
                opacity: 0.98,
                borderRadius: 4,
              }}
            />
          )}
        </View>
        <ContentBadgeContainer>
          {item.isEditable && (
            <EditBadgeContainer>
              <SSIEditIcon color={fontColors.light} />
            </EditBadgeContainer>
          )}
        </ContentBadgeContainer>
      </ContentContainer>}
    </Container>
    </Pressable>
  );
};

export default SSITextField;
