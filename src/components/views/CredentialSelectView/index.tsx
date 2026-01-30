import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {Party} from '@sphereon/ssi-sdk.data-store-types';
import {CredentialMapper} from '@sphereon/ssi-types';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {CredentialDetailsRow, toCredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleProp, View, ViewStyle} from 'react-native';
import Animated, {interpolate, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import ChevronIcon from '../../assets/icons/ChevronIcon';
import {AusweisRequestedInfoItem} from '../../../screens/Onboarding/ImportDataConsentScreen/constants';
import {SSITextH3LightStyled, SSITextH4LightStyled, SSITextH5Styled} from '../../../styles/components';
import {generateDigest} from '../../../utils';
import SelectedCredentialDetailsView from '../SelectedCredentialDetailsView';
import {PressableCredentialMiniCard} from '../PressableCredentialMiniCard';
import {ICredentialState} from '../../../types/store/credential.types';
import {useSelector} from 'react-redux';
import {RootState} from '../../../types';
import {com} from '@sphereon/kmp-mdoc-core';
import {DcqlQuery} from 'dcql';
import {RequestedClaimPath} from '../../../screens/CredentialOverviewShareScreen';

type CredentialSelectViewProps = {
  onSelect: (credential: UniqueDigitalCredential) => void;
  credentials: ReadonlyArray<UniqueDigitalCredential>;
  dcqlQuery: DcqlQuery;
  purpose?: string;
  verifier?: Party;
  style?: StyleProp<ViewStyle>;
  requestedClaims?: Array<RequestedClaimPath>;
};

/**
 * Filters a credential subject object to only include claims at the given paths.
 * Each path is an array of string segments (numbers/nulls ignored for SD-JWT).
 */
function filterClaimsByRequestedPaths(
  subject: Record<string, unknown>,
  requestedClaims: Array<RequestedClaimPath>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const claim of requestedClaims) {
    const segments = claim.path.filter((seg): seg is string => typeof seg === 'string')
    if (segments.length === 0) continue

    // Walk into the source to get the value
    let source: unknown = subject
    for (const seg of segments) {
      if (source == null || typeof source !== 'object') {
        source = undefined
        break
      }
      source = (source as Record<string, unknown>)[seg]
    }

    if (source === undefined) continue

    // Set the value in the result, creating intermediate objects as needed
    let target: Record<string, unknown> = result
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i]
      if (!target[seg] || typeof target[seg] !== 'object') {
        target[seg] = {}
      }
      target = target[seg] as Record<string, unknown>
    }
    target[segments[segments.length - 1]] = source
  }

  return result
}

const CredentialSelectView = (props: CredentialSelectViewProps) => {
  const {purpose, verifier, credentials, onSelect, style, dcqlQuery, requestedClaims} = props;
  const accordionExpanded = useSharedValue(true);
  const chevronRotation = useSharedValue(0);
  const [accordion, setAccordion] = useState(true);
  const hasNoMatches = credentials.length === 0;
  const credentialState: ICredentialState = useSelector((state: RootState) => state.credential);

  const storeCredentialMap = useMemo(() => {
    return new Map(credentialState.verifiableCredentials.map(c => [c.hash, c]));
  }, [credentialState]);

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

  // FIXME disabled this as a PID is just another credential
  // const isPIDCredential = useMemo((): boolean => {
  //   if (!selectedCredential) {
  //     return false;
  //   }
  //   const uniformCredential = CredentialMapper.toUniformCredential(selectedCredential.originalVerifiableCredential!, {hasher: generateDigest});
  //   return uniformCredential.type.some(type => type.includes('/pid'));
  // }, [selectedCredential]);

  const onPressCredential = async (credential: UniqueDigitalCredential): Promise<void> => {
    onSelect(credential);
    setSelectedCredential(prev => {
      if (prev?.hash === credential.hash && credentials.length > 1) {
        // If selected credential has already been selected and there are 2 or more options to match, we deselect it
        return null;
      }
      return credential;
    });

    if (selectedCredential?.hash !== credential.hash) {
      // If a new credential is selected, we load the credential content to display
      await loadCredentialContent(credential, dcqlQuery);
    }
  };

  const loadCredentialContent = async (credential: UniqueDigitalCredential, dcqlQuery: DcqlQuery): Promise<void> => {
    const uniformCredential = CredentialMapper.toUniformCredential(credential.originalVerifiableCredential!, {hasher: generateDigest});

    let subjectToDisplay: Record<string, unknown> = {...uniformCredential.credentialSubject}

    // Apply selective disclosure filtering when DCQL claims are specified
    if (requestedClaims && requestedClaims.length > 0) {
      subjectToDisplay = filterClaimsByRequestedPaths(subjectToDisplay, requestedClaims)
    }

    setCredentialContent(
      await toCredentialDetailsRow({
        object: subjectToDisplay,
      }),
    );
  };

  useEffect((): void => {
    if (!credentials.length) {
      return;
    }

    if (credentials.length === 1) {
      onSelect(credentials[0]);
      setSelectedCredential(credentials[0]);
      void loadCredentialContent(credentials[0], dcqlQuery);
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
            key={idx}
            credential={credential}
            selected={credential.hash === selectedCredential?.hash}
            onPress={() => onPressCredential(credential)}
          />
        ))}
      </ScrollView>
      <View style={{flexDirection: 'row', gap: 10, justifyContent: 'space-between', marginBottom: 16}}>
        <SSITextH3LightStyled numberOfLines={1} style={{flex: 1, ...(hasNoMatches && {color: '#D74500'})}}>
          {/* {selectedCredential ? verifier?.contact?.displayName : 'Select a credential'} */}
          {selectedCredential
            ? storeCredentialMap.get(selectedCredential.hash)?.branding?.alias ?? storeCredentialMap?.get(selectedCredential.hash)?.title
            : hasNoMatches
            ? 'No Available Credentials'
            : 'Select a credential'}
        </SSITextH3LightStyled>
        <Pressable onPress={onToggleAccordion} style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
          <SSITextH5Styled style={{color: selectedCredential ? '#0B81FF' : fontColors.light}}>
            {/* Not sure where this "1" refers to */}
            {hasNoMatches ? '0 available' : `${selectedCredential ? 1 : 0} selected`}
          </SSITextH5Styled>
          <Animated.View style={[chevronStyles, {marginTop: 1}]}>
            <ChevronIcon size={16} color={backgroundColors.primaryLight} />
          </Animated.View>
        </Pressable>
      </View>
      {
        // FIXME disabled this as a PID is just another credential
        //   isPIDCredential ? (
        //   <ImportInformationSummary data={credentialContent as Array<AusweisRequestedInfoItem>} />
        // ) : (
        accordion && selectedCredential && (
          <SelectedCredentialDetailsView valid={!!selectedCredential} credentialProperties={credentialContent as Array<CredentialDetailsRow>} />
          // )
        )
      }
    </View>
  );
};

export default CredentialSelectView;
