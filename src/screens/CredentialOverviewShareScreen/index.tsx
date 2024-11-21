import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CredentialMapper} from '@sphereon/ssi-types';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton, SSILogo as Logo, SSITextH3LightStyled, SSITextH4LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {CredentialDetailsRow, toCredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Pressable, ScrollView, StyleProp, View, ViewStyle} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated, {interpolate, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import styled from 'styled-components/native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import {translate} from '../../localization/Localization';
import SSICredentialDetailsView from '../../components/views/SSICredentialDetailsView';
import {SSITextH2SemiBoldLightStyled, SSITextH5Styled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList, ToastTypeEnum} from '../../types';
import {generateDigest, showToast} from '../../utils';
import {ImportInformationSummary} from '../Onboarding/ImportDataConsentScreen/components/ImportInformationSummary';
import {ProviderContainer, ProviderDescription} from '../Onboarding/ImportDataConsentScreen/components/styles';
import {convertFromPIDPayload} from '../Onboarding/ImportDataConsentScreen/util';
import {AusweisRequestedInfoItem} from '../Onboarding/ImportDataConsentScreen/constants';
import RelyingPartyView from 'src/components/views/RelyingPartyView';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import ChevronIcon from 'src/components/assets/icons/ChevronIcon';
import {ICredentialBranding, Party} from '@sphereon/ssi-sdk.data-store';
import agent from '../../agent';

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
  const {credentials, verifier, presentationDefinition, onSelectAndSend, onDecline} = props.route.params;

  const [selectedCredentials, setSelectedCredentials] = useState<{[key: string]: UniqueDigitalCredential | null}>(
    presentationDefinition.input_descriptors.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: null,
      }),
      {},
    ),
  );

  const selectCredential = (inputDescriptorId: string, credential: UniqueDigitalCredential) => {
    const exists = selectedCredentials[inputDescriptorId]?.hash === credential.hash;
    if (!exists) setSelectedCredentials(creds => ({...creds, [inputDescriptorId]: credential}));
  };

  console.log(
    'selected',
    Object.values(selectedCredentials).map(cred => cred?.id),
  );

  const [credentialsBranding, setCredentialsBranding] = useState<Array<ICredentialBranding>>([]);
  const loadCredentialBranding = async () => {
    const vcHashes = credentials.map(credential => ({vcHash: credential.hash}));
    setCredentialsBranding(await agent.ibGetCredentialBranding({filter: vcHashes}));
  };

  useEffect(() => {
    loadCredentialBranding();
  }, [credentials]);
  if (credentials.length === 0) {
    showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('credentials_required_no_available_label')}); // FIXME Funke
    onDecline();
    return; // FIXME Funke, we need to go to an error / warn screen for this
  }
  const uniformCredentials = credentials.map(credential =>
    CredentialMapper.toUniformCredential(credential.originalVerifiableCredential!, {hasher: generateDigest}),
  );

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
    <View style={{gap: 10, flexDirection: 'column'}}>
      <PrimaryButton
        style={{height: 42}}
        caption={translate('action_share_label')}
        captionColor={fontColors.light}
        disabled={Object.values(selectedCredentials).filter(s => !!s).length !== presentationDefinition.input_descriptors.length}
        onPress={() => {
          if (!selectedCredentials.length) return null;
          onSelectAndSend(Object.values(selectedCredentials).filter(s => !!s));
        }}
      />
      <SecondaryButton
        style={{height: 42}}
        caption={translate('action_decline_label')}
        captionColor={fontColors.secondaryButton}
        onPress={() => onDecline()}
      />
    </View>
  );
  return (
    <ScreenContainer footer={footer} style={{paddingHorizontal: 0}}>
      <View style={{paddingHorizontal: 20, paddingTop: 20}}>
        {/* <ScreenTitleAndDescription
          title="Information request"
          description={verifier.contact?.displayName + ' would like to receive the following information from you for verification.'}
        />*/}
        <RelyingPartyView party={verifier} />
      </View>
      <View style={{paddingHorizontal: 16}}>
        {presentationDefinition.purpose && (
          <ProviderContainer style={{marginBottom: 0}}>
            <ProviderDescription>
              <SSITextH3LightStyled>Reason</SSITextH3LightStyled>
              <SSITextH4LightStyled>{presentationDefinition.purpose}</SSITextH4LightStyled>
            </ProviderDescription>
          </ProviderContainer>
        )}
        <SSITextH2SemiBoldLightStyled style={{marginTop: 10}}>The following information will be shared</SSITextH2SemiBoldLightStyled>
      </View>
      {presentationDefinition.input_descriptors.map(inputDescriptor => (
        <CredentialSelectView
          style={{marginTop: 5}}
          key={inputDescriptor.id}
          credentials={credentials}
          credentialsBranding={credentialsBranding}
          onSelect={(credential: UniqueDigitalCredential) => {
            console.log('in select');
            selectCredential(inputDescriptor.id, credential);
          }}
          purpose={inputDescriptor.purpose}
          verifier={verifier}
        />
      ))}
    </ScreenContainer>
  );
};

type CredentialSelectViewProps = {
  onSelect: (credential: UniqueDigitalCredential) => void;
  credentials: UniqueDigitalCredential[];
  purpose?: string;
  credentialsBranding: ICredentialBranding[];
  verifier?: Party;
  style?: StyleProp<ViewStyle>;
};

const CredentialSelectView = (props: CredentialSelectViewProps) => {
  const {purpose, credentialsBranding, verifier, credentials, onSelect, style} = props;
  const ref = useRef<ScrollView>(null);
  const accordionExpanded = useSharedValue(false);
  const chevronRotation = useSharedValue(0);

  const chevronStyles = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${interpolate(chevronRotation.value, [0, 1], [0, 180])}deg`}],
    };
  });

  const listStyles = useAnimatedStyle(() => {
    return {
      height: `${interpolate(chevronRotation.value, [0, 1], [0, 100])}%`,
    };
  });

  const onToggleAccordion = () => {
    chevronRotation.value = withTiming(chevronRotation.value === 0 ? 1 : 0, {duration: 200});
    accordionExpanded.value = !accordionExpanded.value;
  };

  const [selectedCredential, setSelectedCredential] = useState<UniqueDigitalCredential | null>(null);
  const [credentialContent, setCredentialContent] = useState<AusweisRequestedInfoItem[] | CredentialDetailsRow[]>([]);

  const isPIDCredential = useMemo(() => {
    if (!selectedCredential) return false;
    const uniformCredential = CredentialMapper.toUniformCredential(selectedCredential.originalVerifiableCredential!, {hasher: generateDigest});
    return uniformCredential.type.some(type => type.includes('/pid'));
  }, [selectedCredential]);
  // const uniformCredential = CredentialMapper.toUniformCredential(credentials.originalVerifiableCredential!, {hasher: generateDigest});
  // const isPIDCredential = uniformCredential.type.some(type => type.includes('/pid'));

  const onPressCredential = async (hash: string) => {
    const credential = credentials.find(c => c.hash === hash);
    if (!credential) return;
    onSelect(credential);
    setSelectedCredential(credential);
    loadCredentialContent(credential);
  };

  const loadCredentialContent = async (credential: UniqueDigitalCredential) => {
    const uniformCredential = CredentialMapper.toUniformCredential(credential.originalVerifiableCredential!, {hasher: generateDigest});
    const isPIDCredential = uniformCredential.type.some(type => type.includes('/pid'));

    if (isPIDCredential) {
      setCredentialContent(convertFromPIDPayload(uniformCredential.credentialSubject, 'disclose'));
    } else {
      setCredentialContent(
        await toCredentialDetailsRow({
          object: {...uniformCredential.credentialSubject},
        }),
      );
    }
  };

  useEffect(() => {
    if (!credentials.length) return;

    if (credentials.length === 1) {
      setSelectedCredential(credentials[0]);
      loadCredentialContent(credentials[0]);
    }
  }, []);

  return (
    <View style={[{backgroundColor: backgroundColors.secondaryDark, padding: 24}, style]}>
      {purpose && <SSITextH4LightStyled style={{marginBottom: 10}}>{purpose}</SSITextH4LightStyled>}
      <ScrollView
        ref={ref}
        horizontal
        contentContainerStyle={{
          columnGap: 12,
          padding: 8,
          marginBottom: 16,
        }}>
        {credentialsBranding.map((credential, idx) => (
          <TouchableOpacity key={credential.vcHash} onPress={() => onPressCredential(credential.vcHash)}>
            <MiniCard
              style={{
                borderColor: 'blue',
                borderWidth: selectedCredential?.hash === credential.vcHash ? 1 : 0,
              }}>
              <Logo logo={credential.localeBranding?.at(idx)?.logo} />
            </MiniCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{flexDirection: 'row', gap: 10, justifyContent: 'space-between', marginBottom: 16}}>
        <SSITextH3LightStyled numberOfLines={1} style={{flex: 1}}>
          {selectedCredential ? verifier?.contact?.displayName : 'Select a credential'}
        </SSITextH3LightStyled>
        <Pressable onPress={onToggleAccordion} style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
          <SSITextH5Styled style={{color: selectedCredential ? '#0B81FF' : fontColors.light}}>
            {/* Not sure where this "1" refers to */}
            {selectedCredential ? 1 : 0} selected
          </SSITextH5Styled>
          <Animated.View style={[chevronStyles, {marginTop: 1}]}>
            <ChevronIcon size={16} color={backgroundColors.primaryLight} />
          </Animated.View>
        </Pressable>
      </View>
      <Animated.View style={[{flex: 1}, listStyles]}>
        {isPIDCredential ? (
          <ImportInformationSummary data={credentialContent as Array<AusweisRequestedInfoItem>} />
        ) : (
          <SSICredentialDetailsView credentialProperties={credentialContent as Array<CredentialDetailsRow>} />
        )}
      </Animated.View>
    </View>
  );
};

export default SelectOverviewShareScreen;
