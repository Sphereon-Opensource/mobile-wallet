import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {Party} from '@sphereon/ssi-sdk.data-store';
import {CredentialMapper} from '@sphereon/ssi-types';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {CredentialDetailsRow, toCredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Pressable, ScrollView, StyleProp, View, ViewStyle} from 'react-native';
import Animated, {interpolate, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import ChevronIcon from '../../assets/icons/ChevronIcon';
import {ImportInformationSummary} from '../../../screens/Onboarding/ImportDataConsentScreen/components/ImportInformationSummary';
import {AusweisRequestedInfoItem} from '../../../screens/Onboarding/ImportDataConsentScreen/constants';
import {convertFromPIDPayload} from '../../../screens/Onboarding/ImportDataConsentScreen/util';
import {SSITextH3LightStyled, SSITextH4LightStyled, SSITextH5Styled} from '../../../styles/components';
import {generateDigest} from '../../../utils';
import SelectedCredentialDetailsView from '../SelectedCredentialDetailsView';
import {PressableCredentialMiniCard} from '../PressableCredentialMiniCard';

type CredentialSelectViewProps = {
  onSelect: (credential: UniqueDigitalCredential) => void;
  credentials: UniqueDigitalCredential[];
  purpose?: string;
  verifier?: Party;
  style?: StyleProp<ViewStyle>;
};

export const CredentialSelectView = (props: CredentialSelectViewProps) => {
  const {purpose, verifier, credentials, onSelect, style} = props;
  const accordionExpanded = useSharedValue(true);
  const chevronRotation = useSharedValue(0);
  const [accordion, setAccordion] = useState(true);

  const chevronStyles = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${interpolate(chevronRotation.value, [0, 1], [0, 180])}deg`}],
    };
  });

  const onToggleAccordion = () => {
    chevronRotation.value = withTiming(chevronRotation.value === 0 ? 1 : 0, {duration: 200});
    accordionExpanded.value = !accordionExpanded.value;
    setAccordion(a => !a);
  };

  const [selectedCredential, setSelectedCredential] = useState<UniqueDigitalCredential | null>(null);
  const [credentialContent, setCredentialContent] = useState<AusweisRequestedInfoItem[] | CredentialDetailsRow[]>([]);

  const isPIDCredential = useMemo(() => {
    if (!selectedCredential) return false;
    const uniformCredential = CredentialMapper.toUniformCredential(selectedCredential.originalVerifiableCredential!, {hasher: generateDigest});
    return uniformCredential.type.some(type => type.includes('/pid'));
  }, [selectedCredential]);

  const onPressCredential = async (credential: UniqueDigitalCredential) => {
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
      onSelect(credentials[0]);
      setSelectedCredential(credentials[0]);
      loadCredentialContent(credentials[0]);
    }
  }, []);

  return (
    <View style={[{backgroundColor: backgroundColors.secondaryDark, padding: 24}, style]}>
      {purpose && <SSITextH4LightStyled style={{marginBottom: 10}}>{purpose}</SSITextH4LightStyled>}
      <ScrollView
        horizontal
        contentContainerStyle={{
          columnGap: 12,
          padding: 8,
          marginBottom: 16,
        }}>
        {credentials.map((credential, idx) => (
          <PressableCredentialMiniCard
            key={credential.hash}
            credential={credential}
            selected={credential.hash === selectedCredential?.hash}
            onPress={() => onPressCredential(credential)}
          />
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
      {isPIDCredential ? (
        <ImportInformationSummary data={credentialContent as Array<AusweisRequestedInfoItem>} />
      ) : (
        accordion &&
        selectedCredential && (
          <SelectedCredentialDetailsView valid={!!selectedCredential} credentialProperties={credentialContent as Array<CredentialDetailsRow>} />
        )
      )}
    </View>
  );
};
