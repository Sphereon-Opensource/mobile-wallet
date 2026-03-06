import React, {FC} from 'react';
import {LayoutChangeEvent, ListRenderItemInfo, Pressable, StyleProp, View, ViewProps, ViewStyle} from 'react-native';

import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../../@config/constants';
import {translate} from '../../../localization/Localization';
import {
  SSICredentialDetailsViewContainerStyled as Container,
  SSIDetailsViewDetailsListStyled as DetailsList,
  SSICredentialDetailsViewFooterContainerStyled as FooterContainer,
  SSICredentialDetailsViewFooterLabelValueStyled as IssuedBy,
  SSICredentialDetailsViewFooterLabelCaptionStyled as IssuedByLabel,
  SSITextH4LightStyled,
} from '../../../styles/components';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import SSIEyeIcon from '../../assets/icons/SSIEyeIcon';
import SSIEyeOffIcon from '../../assets/icons/SSIEyeOffIcon';
import SSIImageField from '../../fields/SSIImageField';
import SSITextField from '../../fields/SSITextField';

export interface IProps {
  credentialProperties: Array<CredentialDetailsRow>;
  issuer?: string;
  onLayout?: (e: LayoutChangeEvent) => void;
  valid?: boolean;
  valuesVisible?: boolean;
  onToggleVisibility?: () => void;
}

// TODO we are now using this for more than just credential information. Would be nice to refactor it to be a more general usage component

const SelectedCredentialDetailsView: FC<IProps> = (props: IProps): JSX.Element => {
  const {onLayout, valid, valuesVisible, onToggleVisibility} = props;

  const renderFooter = () => (
    <FooterContainer>
      {props.issuer && (
        <>
          <IssuedByLabel>{translate('credential_details_view_issued_by')}</IssuedByLabel>
          <IssuedBy>{props.issuer}</IssuedBy>
        </>
      )}
    </FooterContainer>
  );

  return (
    <Container style={{borderColor: '#5D6990', borderRadius: 10, borderWidth: 1, overflow: 'hidden', borderLeftWidth: valid ? 0 : 1}}>
      {valid && (
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'green',
            width: 10,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            height: '100%',
          }}></View>
      )}
      <View onLayout={onLayout} style={{flex: 1, position: 'relative'}}>
        <View
          style={{
            position: 'absolute',
            top: '15%',
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 1,
          }}
          pointerEvents="box-none">
          <Pressable onPress={onToggleVisibility}>
            {valuesVisible ? <SSIEyeIcon size={60} color="#353D5E" /> : <SSIEyeOffIcon size={60} color="#353D5E" />}
          </Pressable>
        </View>
        <View style={{zIndex: 2}} pointerEvents="box-none">
          {props.credentialProperties.map((property, idx) =>
            property.imageSize ? <SSIImageField key={idx} item={property} valuesVisible={valuesVisible} onToggleVisibility={onToggleVisibility} /> : <SSITextField key={idx} item={property} valuesVisible={valuesVisible} onToggleVisibility={onToggleVisibility} />,
          )}
        </View>
      </View>
      {renderFooter()}
    </Container>
  );
};

export default SelectedCredentialDetailsView;
