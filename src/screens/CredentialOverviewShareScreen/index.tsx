import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, { FC, ReactElement, useMemo, useState } from 'react'
import {View} from 'react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import RelyingPartyView from '../../components/views/RelyingPartyView';
import {translate} from '../../localization/Localization';
import {SSITextH2SemiBoldLightStyled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import CredentialSelectView from '../../components/views/CredentialSelectView';
import {DcqlQuery} from 'dcql';
import {convertToDcqlCredentials} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_SHARE_OVERVIEW>;

// TODO any
const filterCredentialsByCredentialSet = (credentials: UniqueDigitalCredential[], credentialSet: any) => {
  // const presentationDefinition: IPresentationDefinition = {
  //   id: inputDescriptor.id,
  //   //@ts-ignore
  //   input_descriptors: [inputDescriptor],
  // };

  // const pex: PEX = new PEX({hasher: generateDigest});
  // const result: SelectResults = pex.selectFrom(
  //   presentationDefinition,
  //   credentials.map(c => c.originalVerifiableCredential!),
  // );

  // const subsetCredentials = [];
  // if (
  //   result.areRequiredCredentialsPresent !== 'error' &&
  //   result.verifiableCredential &&
  //   result.vcIndexes &&
  //   result.vcIndexes.length === result.verifiableCredential?.length
  // ) {
  //   for (let i = 0; i < result.vcIndexes.length; i++) {
  //     const index = result.vcIndexes[i];
  //     if (index < 0 || index >= credentials.length) {
  //       throw new Error(`Index ${index} at position ${i} is out of bounds. Valid range is 0 to ${credentials.length - 1}.`);
  //     }
  //     const selectedCredential = credentials[index];
  //     selectedCredential.originalVerifiableCredential = result.verifiableCredential?.[i];
  //     subsetCredentials.push(selectedCredential);
  //   }
  // }

  return []
};

const matchCredentialsWithDcqlQuery = (credentials: UniqueDigitalCredential[], dcqlQuery: DcqlQuery) => {
  if (dcqlQuery.credential_sets) {
    // TODO match on credential sets
  }

  const dcqlCredentialsWithCredentials = new Map(
    credentials.map((vc) => [convertToDcqlCredentials(vc), vc])
  )

  const queryResult = DcqlQuery.query(dcqlQuery, Array.from(dcqlCredentialsWithCredentials.keys()))

  const selectableCredentialsMap = new Map()
  for (const [key, value] of Object.entries(queryResult.credential_matches)) {
    if (!value.valid_credentials) {
      continue
    }
    const matchedCredentials = value.valid_credentials.map(cred => credentials[cred.input_credential_index])
    selectableCredentialsMap.set(key, matchedCredentials)
  }

  return selectableCredentialsMap;
};

const SelectOverviewShareScreen: FC<Props> = (props: Props): ReactElement => {
  // memoize filtered and other values
  const {credentials, verifier, dcqlQuery, onSelectAndSend, onDecline} = props.route.params;
  const credsPerRequestedCredential = useMemo(
    //@ts-ignore
    () => matchCredentialsWithDcqlQuery(credentials, dcqlQuery),
    [credentials, dcqlQuery],
  );

  //FIXME Funke, make this support multi credential selection per input descriptor
  const [selectedCredentials, setSelectedCredentials] = useState<{[key: string]: UniqueDigitalCredential | null}>(
    dcqlQuery.credentials.reduce(
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
        disabled={Object.values(selectedCredentials).filter(cred => !!cred).length !== dcqlQuery.credentials.length} //presentationDefinition
        onPress={async () => {
          const selected = Object.values(selectedCredentials).filter(c => !!c);
          if (!selected.length) {
            return;
          }
          await onSelectAndSend(
            Object.values(selectedCredentials).filter(
              (s): s is UniqueDigitalCredential => s !== null
            )
          );
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
      {/*<View style={{paddingHorizontal: 16}}>*/}
        {/*// FIXME purpose */}
        {/*{presentationDefinition.purpose && (*/}
        {/*  <ProviderContainer style={{marginBottom: 0}}>*/}
        {/*    <ProviderDescription>*/}
        {/*      <SSITextH3LightStyled>Reason</SSITextH3LightStyled>*/}
        {/*      <SSITextH4LightStyled>{presentationDefinition.purpose}</SSITextH4LightStyled>*/}
        {/*    </ProviderDescription>*/}
        {/*  </ProviderContainer>*/}
        {/*)}*/}
      {/*</View>*/}
      {dcqlQuery.credentials.map((requestedCredential, idx) => ( //input_descriptors
        <View key={idx}>
          <SSITextH2SemiBoldLightStyled style={{marginTop: 10, paddingLeft: 24}}>
            {idx === 0 ? 'The following information will be shared' : `Item ${idx + 1}`}
          </SSITextH2SemiBoldLightStyled>
          <CredentialSelectView
            style={{marginTop: 5}}
            credentials={credsPerRequestedCredential.get(requestedCredential.id) ?? []}
            onSelect={(credential: UniqueDigitalCredential) => {
              selectCredential(requestedCredential.id, credential);
            }}
            dcqlQuery={dcqlQuery}
            //purpose={inputDescriptor.purpose} // FIXME
            verifier={verifier}
          />
        </View>
      ))}
    </ScreenContainer>
  );
};

export default SelectOverviewShareScreen;
