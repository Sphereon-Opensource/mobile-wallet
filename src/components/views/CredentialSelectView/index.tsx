import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {Party, CredentialDocumentFormat} from '@sphereon/ssi-sdk.data-store';
import {
  CredentialMapper,
  decodeMdocIssuerSigned,
  getMdocDecodedPayload,
  mdocDecodedCredentialToUniformCredential,
  MdocDocument,
  MdocOid4vpIssuerSigned,
} from '@sphereon/ssi-types';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {CredentialDetailsRow, toCredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {useEffect, useMemo, useState} from 'react';
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
import {ICredentialState} from '../../../types/store/credential.types';
import {useSelector} from 'react-redux';
import {RootState} from '../../../types';
import {IPresentationDefinition} from '@sphereon/pex';
import {com} from '@sphereon/kmp-mdoc-core';
import IOid4VPPresentationDefinition = com.sphereon.mdoc.oid4vp.IOid4VPPresentationDefinition;
import { DcqlQuery } from 'dcql';

type CredentialSelectViewProps = {
  onSelect: (credential: UniqueDigitalCredential) => void;
  credentials: UniqueDigitalCredential[];
  //presentationDefinition: IPresentationDefinition;
  dcqlQuery: DcqlQuery;
  purpose?: string;
  verifier?: Party;
  style?: StyleProp<ViewStyle>;
};

const CredentialSelectView = (props: CredentialSelectViewProps) => {
  const {purpose, verifier, credentials, onSelect, style, dcqlQuery} = props;
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
    setSelectedCredential(credential);
    await loadCredentialContent(credential, dcqlQuery);
  };

  const loadCredentialContent = async (credential: UniqueDigitalCredential, dcqlQuery: DcqlQuery): Promise<void> => {
    const uniformCredential = CredentialMapper.toUniformCredential(credential.originalVerifiableCredential!, {hasher: generateDigest});
    // FIXME disabled this as a PID is just another credential
    //const isPIDCredential = uniformCredential.type.some(type => type.includes('/pid'));

    // FIXME SSISDK-43 apply select disclosure
    // if (isPIDCredential) {
    //   setCredentialContent(convertFromPIDPayload(uniformCredential.credentialSubject, 'disclose'));
    // } else {

    // FIXME SSISDK-43 apply select disclosure
    // if (credential.digitalCredential.documentFormat === CredentialDocumentFormat.MSO_MDOC) {
    //   const decodedMdoc = decodeMdocIssuerSigned(credential.originalVerifiableCredential as MdocOid4vpIssuerSigned);
    //   const limitDisclosedMdoc = decodedMdoc.limitDisclosureFromPresentationDefinition(pd as IOid4VPPresentationDefinition);
    //   const payload = getMdocDecodedPayload(limitDisclosedMdoc);
    //   setCredentialContent(
    //     await toCredentialDetailsRow({
    //       object: payload,
    //     }),
    //   );
    // } else {
      setCredentialContent(
        await toCredentialDetailsRow({
          object: {...uniformCredential.credentialSubject},
        }),
      );
    // }
    // }
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
