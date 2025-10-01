import React, { FC, ReactElement, useMemo, useState } from 'react'
import {View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {DcqlQuery} from 'dcql';
import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {convertToDcqlCredentials} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import CredentialSelectView from '../../components/views/CredentialSelectView';
import ScreenContainer from '../../components/containers/ScreenContainer';
import RelyingPartyView from '../../components/views/RelyingPartyView';
import {translate} from '../../localization/Localization';
import {SSITextH2SemiBoldLightStyled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_SHARE_OVERVIEW>;

type GetCredentialSelectViewElement = {
  index: number
  itemId: string | number
  credentials?: Array<UniqueDigitalCredential>
  purpose?: string  // FIXME SSISDK-42, we need a map purpose function
}

const matchCredentialsWithDcqlQuery = (credentials: UniqueDigitalCredential[], dcqlQuery: DcqlQuery) => {
  const dcqlCredentialsWithCredentials = new Map(
    credentials.map((vc) => [convertToDcqlCredentials(vc), vc])
  )

  const queryResult = DcqlQuery.query(dcqlQuery, Array.from(dcqlCredentialsWithCredentials.keys()))

  const selectableCredentialsMap = new Map()
  if (queryResult.credential_sets) {
    queryResult.credential_sets.forEach((credentialSet, index) => {
      if (!credentialSet.matching_options) {
        return
      }
      const credentialSetMatches: Array<UniqueDigitalCredential> = [];
      credentialSet.matching_options.forEach(options => {
        options.flat().forEach(option => {
          const matchedCredentials = queryResult.credential_matches[option]?.valid_credentials?.map(cred => credentials[cred.input_credential_index]) ?? []
          credentialSetMatches.push(...matchedCredentials);
        })
      })

      selectableCredentialsMap.set(index, credentialSetMatches);
    })
  } else {
    for (const [key, value] of Object.entries(queryResult.credential_matches)) {
      if (!value.valid_credentials) {
        continue
      }
      const matchedCredentials = value.valid_credentials.map(cred => credentials[cred.input_credential_index])
      selectableCredentialsMap.set(key, matchedCredentials)
    }
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
  const [selectedCredentials, setSelectedCredentials] = useState<{[key: string | number]: UniqueDigitalCredential | null}>(
    dcqlQuery.credential_sets
     ? dcqlQuery.credential_sets.reduce(
        (prev, _curr, index) => ({
          ...prev,
          [index]: null,
        }),
        {},
      )
     : dcqlQuery.credentials.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.id]: null,
        }),
        {},
      )
  );

  //FIXME Funke, make this support multi credential selection per input descriptor
  const selectCredential = (id: string | number, credential: UniqueDigitalCredential) => {
    setSelectedCredentials(prev => {
      const exists = prev[id]?.hash === credential.hash;

      return {
        ...prev,
        [id]: exists && credsPerRequestedCredential.get(id)?.length > 1 ? null : credential,
      };
    });
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

  const getCredentialSelectViewElement = (args: GetCredentialSelectViewElement): ReactElement => {
    const {
      credentials = [],
      index,
      itemId,
      purpose
    } = args

    return (
      <View key={index}>
        <SSITextH2SemiBoldLightStyled style={{marginTop: 10, paddingLeft: 24}}>
          {index === 0 ? 'The following information will be shared' : `Item ${index + 1}`}
        </SSITextH2SemiBoldLightStyled>
        <CredentialSelectView
          style={{marginTop: 5}}
          credentials={credentials}
          onSelect={(credential: UniqueDigitalCredential) => selectCredential(itemId, credential)}
          dcqlQuery={dcqlQuery}
          {...(purpose&& { purpose })}
          verifier={verifier}
        />
      </View>
    )
  }

  return (
    <ScreenContainer footer={footer} style={{paddingHorizontal: 0}}>
      <View style={{paddingHorizontal: 20, paddingTop: 20}}>
        <RelyingPartyView party={verifier} onPress={onPressRP} />
      </View>
      {/*<View style={{paddingHorizontal: 16}}>*/}
        {/*// FIXME SSISDK-42 purpose */}
        {/*{presentationDefinition.purpose && (*/}
        {/*  <ProviderContainer style={{marginBottom: 0}}>*/}
        {/*    <ProviderDescription>*/}
        {/*      <SSITextH3LightStyled>Reason</SSITextH3LightStyled>*/}
        {/*      <SSITextH4LightStyled>{presentationDefinition.purpose}</SSITextH4LightStyled>*/}
        {/*    </ProviderDescription>*/}
        {/*  </ProviderContainer>*/}
        {/*)}*/}
      {/*</View>*/}

      { dcqlQuery.credential_sets
        ? dcqlQuery.credential_sets!.map((credentialSet, index) => getCredentialSelectViewElement({
            index,
            itemId: index,
            credentials: credsPerRequestedCredential.get(index),
            purpose: credentialSet.purpose?.toString() // FIXME SSISDK-42, we need a map purpose function
          })
        )
        : dcqlQuery.credentials.map((requestedCredential, index) => getCredentialSelectViewElement({
            index,
            itemId: requestedCredential.id,
            credentials: credsPerRequestedCredential.get(requestedCredential.id),
          })
        )
      }
    </ScreenContainer>
  );
};

export default SelectOverviewShareScreen;
