import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PEX, SelectResults} from '@sphereon/pex';
import {Status} from '@sphereon/pex/dist/main/lib/ConstraintUtils';
import {InputDescriptorV1, InputDescriptorV2} from '@sphereon/pex-models';
import {CredentialMapper, IVerifiableCredential, OriginalVerifiableCredential, W3CVerifiableCredential} from '@sphereon/ssi-types';
import {UniqueVerifiableCredential} from '@veramo/core';
import React, {FC, useEffect, useState} from 'react';
import {ListRenderItemInfo} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';

import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSICredentialRequiredViewItem from '../../components/views/SSICredentialRequiredViewItem';
import {translate} from '../../localization/Localization';
import {getVerifiableCredentialsFromStorage} from '../../services/credentialService';
import {
  SSIBasicContainerStyled as Container,
  SSICredentialsRequiredScreenButtonContainerStyled as ButtonContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {toCredentialSummary} from '../../utils/mappers/CredentialMapper';
import {getMatchingUniqueVerifiableCredential} from '../../utils/CredentialUtils';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIALS_REQUIRED>;

const SSICredentialsRequiredScreen: FC<Props> = (props: Props): JSX.Element => {
  const {presentationDefinition} = props.route.params;
  const [selectedCredentials, setSelectedCredentials] = useState(new Map<string, Array<UniqueVerifiableCredential>>());
  const [availableCredentials, setAvailableCredentials] = useState(new Map<string, Array<UniqueVerifiableCredential>>());
  const pex = new PEX();

  useEffect(() => {
    getVerifiableCredentialsFromStorage().then((uniqueVCs: Array<UniqueVerifiableCredential>) => {
      // We need to go to a wrapped VC first to get an actual original Verifiable Credential in JWT format, as they are stored with a special Proof value in Veramo
      const originalVcs: Array<OriginalVerifiableCredential> = uniqueVCs.map(
        (vc: UniqueVerifiableCredential) =>
          CredentialMapper.toWrappedVerifiableCredential(vc.verifiableCredential as OriginalVerifiableCredential).original,
      );
      const credentials = new Map<string, Array<UniqueVerifiableCredential>>();
      presentationDefinition.input_descriptors.forEach((inputDescriptor: InputDescriptorV1 | InputDescriptorV2) => {
        const presentationDefinition = {
          id: inputDescriptor.id,
          input_descriptors: [inputDescriptor],
        };
        const selectResult: SelectResults = pex.selectFrom(presentationDefinition, originalVcs);
        const matchedCredentials: Array<UniqueVerifiableCredential> = selectResult.verifiableCredential
          ? selectResult.verifiableCredential
              .map((matchedVC: IVerifiableCredential) => getMatchingUniqueVerifiableCredential(uniqueVCs, matchedVC))
              .filter((matchedVC): matchedVC is UniqueVerifiableCredential => !!matchedVC) // filter out the undefined (should not happen)
          : [];
        credentials.set(inputDescriptor.id, matchedCredentials);
      });
      setAvailableCredentials(credentials);
    });
  }, []);

  useEffect(() => {
    const credentials = new Map<string, Array<UniqueVerifiableCredential>>();
    presentationDefinition.input_descriptors.forEach((inputDescriptor: InputDescriptorV1 | InputDescriptorV2) =>
      credentials.set(inputDescriptor.id, []),
    );
    setSelectedCredentials(credentials);
  }, [presentationDefinition]);

  const onDecline = async () => {
    props.navigation.goBack();
  };

  const onSend = async () => {
    const {onSend} = props.route.params;
    const credentials = getSelectedCredentials();

    await onSend(credentials);
  };

  const getSelectedCredentials = (): Array<UniqueVerifiableCredential> => {
    const credentials: Array<Array<UniqueVerifiableCredential>> = [];
    for (const vcs of selectedCredentials.values()) {
      credentials.push(vcs);
    }

    return credentials.flat();
  };

  const isMatchingPresentationDefinition = (): boolean => {
    return (
      pex.evaluateCredentials(
        presentationDefinition,
        getSelectedCredentials().map(
          uniqueVC => CredentialMapper.toWrappedVerifiableCredential(uniqueVC.verifiableCredential as W3CVerifiableCredential).original,
        ),
      ).areRequiredCredentialsPresent === Status.INFO
    );
  };

  const onItemPress = async (inputDescriptorId: string, credentials: Array<UniqueVerifiableCredential>) => {
    props.navigation.navigate(ScreenRoutesEnum.CREDENTIALS_SELECT, {
      credentialSelection: credentials.map((uniqueVC: UniqueVerifiableCredential) => {
        const credentialSummary = toCredentialSummary(uniqueVC);
        const wrappedVC = CredentialMapper.toWrappedVerifiableCredential(uniqueVC.verifiableCredential as W3CVerifiableCredential);
        return {
          hash: credentialSummary.hash,
          id: credentialSummary.id,
          credential: credentialSummary,
          rawCredential: wrappedVC.original,
          isSelected: selectedCredentials
            .get(inputDescriptorId)!
            .some(
              matchedUniqueVC =>
                matchedUniqueVC.verifiableCredential.id === uniqueVC.verifiableCredential.id ||
                matchedUniqueVC.verifiableCredential.proof === uniqueVC.verifiableCredential.proof,
            ),
        };
      }),
      // TODO move this to a function, would be nicer
      onSelect: async (hashes: Array<string>) => {
        const selectVCs = availableCredentials.get(inputDescriptorId)!.filter(vc => hashes.includes(vc.hash));
        selectedCredentials.set(inputDescriptorId, selectVCs);
        const newSelection = new Map<string, Array<UniqueVerifiableCredential>>();
        for (const [key, value] of selectedCredentials) {
          newSelection.set(key, value);
        }
        setSelectedCredentials(newSelection);
      },
    });
  };

  // TODO add support for multiple versions of pex, currently using V1
  const renderItem = (itemInfo: ListRenderItemInfo<InputDescriptorV1 | InputDescriptorV2>): JSX.Element => {
    const onPress =
      !availableCredentials.has(itemInfo.item.id) || availableCredentials.get(itemInfo.item.id)!.length === 0
        ? undefined
        : () => onItemPress(itemInfo.item.id, availableCredentials.get(itemInfo.item.id)!);

    return (
      <SSICredentialRequiredViewItem
        id={itemInfo.item.id}
        title={itemInfo.item.name || itemInfo.item.id}
        available={availableCredentials.has(itemInfo.item.id) ? availableCredentials.get(itemInfo.item.id)! : undefined}
        selected={selectedCredentials.has(itemInfo.item.id) ? selectedCredentials.get(itemInfo.item.id)! : []}
        isMatching={
          selectedCredentials.has(itemInfo.item.id)
            ? pex.evaluateCredentials(
                {
                  id: itemInfo.item.id,
                  input_descriptors: [itemInfo.item],
                },
                selectedCredentials
                  .get(itemInfo.item.id)!
                  // To wrapped VC first to get the actual original as Veramo stores JWT credentials not as strings
                  .map(
                    uniqueVC =>
                      CredentialMapper.toWrappedVerifiableCredential(uniqueVC.verifiableCredential as OriginalVerifiableCredential).original,
                  ),
              ).areRequiredCredentialsPresent === Status.INFO
            : false
        }
        listIndex={itemInfo.index}
        onPress={onPress}
      />
    );
  };

  return (
    <Container>
      <StatusBar />
      <SwipeListView
        data={presentationDefinition.input_descriptors}
        keyExtractor={(itemInfo: InputDescriptorV1 | InputDescriptorV2) => itemInfo.id}
        renderItem={renderItem}
        closeOnRowOpen
        closeOnRowBeginSwipe
        useFlatList
        initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
      />
      <ButtonContainer>
        <SSIButtonsContainer
          secondaryButton={{
            caption: translate('action_decline_label'),
            onPress: onDecline,
          }}
          primaryButton={{
            caption: translate('action_send_label'),
            disabled: !isMatchingPresentationDefinition(),
            onPress: onSend,
          }}
        />
      </ButtonContainer>
    </Container>
  );
};

export default SSICredentialsRequiredScreen;
