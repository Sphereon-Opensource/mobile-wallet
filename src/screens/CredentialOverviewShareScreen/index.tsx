import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {fontColors} from '@sphereon/ui-components.core';
import {
  PrimaryButton,
  SecondaryButton,
  SSITextH3LightStyled,
  SSITextH4LightStyled,
} from '@sphereon/ui-components.ssi-react-native';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import RelyingPartyView from "../../components/views/RelyingPartyView";
import {translate} from '../../localization/Localization';
import {SSITextH2SemiBoldLightStyled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {generateDigest} from '../../utils';
import {ProviderContainer, ProviderDescription} from '../Onboarding/ImportDataConsentScreen/components/styles';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {InputDescriptorV1, InputDescriptorV2} from '@sphereon/pex-models';
import {IPresentationDefinition, PEX, SelectResults} from '@sphereon/pex';
import {PresentationDefinitionWithLocation} from '@sphereon/did-auth-siop';
import CredentialSelectView from '../../components/views/CredentialSelectView';
import {CredentialMapper} from '@sphereon/ssi-types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_SHARE_OVERVIEW>;

const filterCredentialsByInputDescriptor = (credentials: UniqueDigitalCredential[], inputDescriptor: InputDescriptorV1 | InputDescriptorV2) => {
  const presentationDefinition: IPresentationDefinition = {
    id: inputDescriptor.id,
    //@ts-ignore
    input_descriptors: [inputDescriptor],
  };

  const pex: PEX = new PEX({hasher: generateDigest});
  const result: SelectResults = pex.selectFrom(
    presentationDefinition,
    credentials.map(c => c.originalVerifiableCredential!),
  );

  const subsetCredentials = [];
  if (
    result.areRequiredCredentialsPresent !== 'error' &&
    result.verifiableCredential &&
    result.vcIndexes &&
    result.vcIndexes.length === result.verifiableCredential?.length
  ) {
    for (let i = 0; i < result.vcIndexes.length; i++) {
      const index = result.vcIndexes[i];
      if (index < 0 || index >= credentials.length) {
        throw new Error(`Index ${index} at position ${i} is out of bounds. Valid range is 0 to ${credentials.length - 1}.`);
      }
      const selectedCredential = credentials[index];
      selectedCredential.originalVerifiableCredential = result.verifiableCredential?.[i];
      subsetCredentials.push(selectedCredential);
    }
  }

  return subsetCredentials;
};

const matchCredsWithInputDescriptors = (
  credentials: UniqueDigitalCredential[],
  input_descriptors: PresentationDefinitionWithLocation['definition']['input_descriptors'],
) => {
  const udcIDMap = new Map(input_descriptors.map(input => [input.id, [] as UniqueDigitalCredential[]]));
  input_descriptors.forEach(input => {
    const results = filterCredentialsByInputDescriptor(credentials, input);
    udcIDMap.set(input.id, results);
  });

  return udcIDMap;
};

const SelectOverviewShareScreen = (props: Props) => {
  // memoize filtered and other values
  const {credentials, verifier, presentationDefinition, onSelectAndSend, onDecline} = props.route.params;
  const input_descriptors = presentationDefinition.input_descriptors;
  const credsPerInputDescriptor = useMemo(
    //@ts-ignore
    () => matchCredsWithInputDescriptors(credentials, input_descriptors),
    [credentials, input_descriptors],
  );

  //FIXME Funke, make this support multi credential selection per input descriptor
  const [selectedCredentials, setSelectedCredentials] = useState<{[key: string]: UniqueDigitalCredential | null}>(
    input_descriptors.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: null,
      }),
      {},
    ),
  );

  //FIXME Funke, make this support multi credential selection per input descriptor
  const selectCredential = (inputDescriptorId: string, credential: UniqueDigitalCredential) => {
    const exists = selectedCredentials[inputDescriptorId]?.hash === credential.hash;
    if (!exists) setSelectedCredentials(creds => ({...creds, [inputDescriptorId]: credential}));
  };

  if (credentials.length === 0) {
    // showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('credentials_required_no_available_label')}); // FIXME Funke
    // onDecline();
    // return; // FIXME Funke, we need to go to an error / warn screen for this
  }

  const footer = (
    <View style={{gap: 10, flexDirection: 'column'}}>
      <PrimaryButton
        style={{height: 42}}
        caption={translate('action_share_label')}
        captionColor={fontColors.light}
        disabled={Object.values(selectedCredentials).filter(c => !!c).length !== presentationDefinition.input_descriptors.length}
        onPress={async () => {
          const selected = Object.values(selectedCredentials).filter(c => !!c);
          if (!selected.length) {
            return;
          }
          await onSelectAndSend(Object.values(selectedCredentials).filter(s => !!s));
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

  const onPressRP = async (): Promise<void> => {
    props.navigation.navigate(ScreenRoutesEnum.CONTACT_DETAILS, {contact: verifier});
  };

  return (
    <ScreenContainer footer={footer} style={{paddingHorizontal: 0}}>
      <View style={{paddingHorizontal: 20, paddingTop: 20}}>
        <RelyingPartyView party={verifier} onPress={onPressRP} />
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
      </View>
      {input_descriptors.map((inputDescriptor, idx) => (
        <View key={idx}>
          <SSITextH2SemiBoldLightStyled style={{marginTop: 10, paddingLeft: 24}}>
            {idx === 0 ? 'The following information will be shared' : `Item ${idx + 1}`}
          </SSITextH2SemiBoldLightStyled>
          <CredentialSelectView
            style={{marginTop: 5}}
            credentials={credsPerInputDescriptor.get(inputDescriptor.id) ?? []}
            onSelect={(credential: UniqueDigitalCredential) => {
              selectCredential(inputDescriptor.id, credential);
            }}
            presentationDefinition={presentationDefinition}
            purpose={inputDescriptor.purpose}
            verifier={verifier}
          />
        </View>
      ))}
    </ScreenContainer>
  );
};

export default SelectOverviewShareScreen;
