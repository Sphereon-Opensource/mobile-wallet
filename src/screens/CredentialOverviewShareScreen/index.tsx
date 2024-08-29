import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton, SSILogo as Logo, SSITextH3LightStyled, SSITextH4LightStyled} from '@sphereon/ui-components.ssi-react-native';
import React, {useMemo, useRef} from 'react';
import {ScrollView, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {interpolate, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import styled from 'styled-components/native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../localization/Localization';

import {SSIContactViewItemLogoContainerStyled as LogoContainer, SSITextH2SemiBoldLightStyled, SSITextH5Styled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList, ToastTypeEnum} from '../../types';
import {showToast} from '../../utils';
import {ImportInformationSummary} from '../Onboarding/ImportDataConsentScreen/components/ImportInformationSummary';

import {ProviderContainer, ProviderDescription} from '../Onboarding/ImportDataConsentScreen/components/styles';
import {convertFromPIDPayload} from '../Onboarding/ImportDataConsentScreen/util';

const MiniCard = styled.Pressable`
  height: 50px;
  width: 78px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
  border-radius: 10px;
  background-color: white;
`;

const BrandingImage = styled.Image`
  height: 40px;
  width: 40px;
`;

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_SHARE_OVERVIEW>;

const RequestedInformationContainer = styled.View`
  border: 1px solid #5d6990;
  border-radius: 8px;
  background-color: #2c334b;
  width: 100%;
  overflow: hidden;
`;

const SelectOverviewShareScreen = (props: Props) => {
  // memoize filtered and other values
  const {credential, verifier, presentationDefinition, onSelectAndSend, onDecline} = props.route.params;

  if (credential === undefined) {
    showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('credentials_required_no_available_label')}); // FIXME Funke
    onDecline();
    return; // FIXME Funke, we need to go to an error / warn screen for this
  }
  const data = useMemo(() => convertFromPIDPayload(credential.uniformVerifiableCredential!.credentialSubject), [credential]);

  const ref = useRef<ScrollView>(null);
  const accordionExpanded = useSharedValue(false);
  const chevronRotation = useSharedValue(0);

  const chevronStyles = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${interpolate(chevronRotation.value, [0, 1], [0, 180])}deg`}],
    };
  });

  const onToggleAccordion = () => {
    chevronRotation.value = withTiming(chevronRotation.value === 0 ? 1 : 0, {duration: 200});
    accordionExpanded.value = !accordionExpanded.value;
  };
  const translationPath = 'share_pages.select_credentials';

  const footer = (
    <>
      <View style={{flex: 1}}>
        <SecondaryButton
          style={{height: 42}}
          caption={translate('action_decline_label')}
          captionColor={fontColors.secondaryButton}
          onPress={() => onDecline()}
        />
      </View>
      <View style={{flex: 1}}>
        <PrimaryButton
          style={{height: 42}}
          caption={translate('action_share_label')}
          captionColor={fontColors.light}
          onPress={() => onSelectAndSend(credential)}
        />
      </View>
    </>
  );
  return (
    <ScreenContainer footer={footer} footerStyle={{flexDirection: 'row', gap: 8}} style={{paddingHorizontal: 0}}>
      <View style={{paddingHorizontal: 20, paddingTop: 20}}>
        {/* <ScreenTitleAndDescription
          title="Information request"
          description={verifier.contact?.displayName + ' would like to receive the following information from you for verification.'}
        />*/}
      </View>
      <View style={{paddingHorizontal: 16}}>
        <ProviderContainer style={{marginBottom: 0}}>
          <ProviderDescription>
            <SSITextH3LightStyled>Purpose</SSITextH3LightStyled>
            <SSITextH4LightStyled>{presentationDefinition.purpose}</SSITextH4LightStyled>
          </ProviderDescription>
        </ProviderContainer>
        <ProviderContainer>
          <LogoContainer>
            {/* FIXME: this should be the crendential branding */}
            <Logo logo={verifier?.branding?.logo} />
          </LogoContainer>
          <ProviderDescription>
            <SSITextH3LightStyled>{verifier?.contact?.displayName}</SSITextH3LightStyled>
            <SSITextH4LightStyled>Verifier</SSITextH4LightStyled>
            {verifier?.uri && <SSITextH4LightStyled style={{color: 'white', marginTop: 4}}>{verifier?.uri}</SSITextH4LightStyled>}
          </ProviderDescription>
        </ProviderContainer>
        <SSITextH2SemiBoldLightStyled>The following information will be shared</SSITextH2SemiBoldLightStyled>
      </View>
      <View style={{backgroundColor: backgroundColors.secondaryDark, padding: 24}}>
        <ScrollView
          ref={ref}
          horizontal
          contentContainerStyle={{
            columnGap: 12,
            padding: 8,
            marginBottom: 16,
          }}>
          <TouchableOpacity key={verifier?.contact?.displayName}>
            {/* <View
              style={{
                width: 75,
                height: 50,
                position: 'relative',
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
                //fixme: add verifier branding to the object that we're passing
                backgroundColor: 'white'
              }}
              key={verifier?.contact?.displayName}>
              <Title>{verifier?.contact?.displayName}</Title>
            </View> */}
            <MiniCard>
              <Logo logo={verifier.branding?.logo} />
            </MiniCard>
          </TouchableOpacity>
        </ScrollView>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16}}>
          <SSITextH3LightStyled>{verifier?.contact?.displayName}</SSITextH3LightStyled>
          <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
            <SSITextH5Styled style={{color: '#0B81FF'}}>{/* Not sure where this "1" refers to */}1 selected</SSITextH5Styled>
            {/* <Animated.View style={[chevronStyles, {marginTop: 1}]}>
              <ChevronIcon size={16} color={backgroundColors.primaryLight} />
            </Animated.View> */}
          </View>
        </View>
        <View style={{flex: 1}}>
          <ImportInformationSummary data={data} />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default SelectOverviewShareScreen;
