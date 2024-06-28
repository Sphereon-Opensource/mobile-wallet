import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useBackHandler} from '@react-native-community/hooks';
import {PEX, SelectResults, SubmissionRequirementMatch, Status, IPresentationDefinition} from '@sphereon/pex';
import {InputDescriptorV1, InputDescriptorV2} from '@sphereon/pex-models';
import {ICredentialBranding} from '@sphereon/ssi-sdk.data-store';
import {CredentialMapper, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {UniqueVerifiableCredential} from '@veramo/core';
import React, {FC, useEffect, useState} from 'react';
import {ListRenderItemInfo} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';

import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import {ibGetCredentialBranding} from '../../agent';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSICredentialRequiredViewItem from '../../components/views/SSICredentialRequiredViewItem';
import {translate} from '../../localization/Localization';
import {getVerifiableCredentialsFromStorage} from '../../services/credentialService';
import {
  SSICredentialsRequiredScreenButtonContainerStyled as ButtonContainer,
  SSIBasicContainerStyled as Container,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {getMatchingUniqueVerifiableCredential, getOriginalVerifiableCredential} from '../../utils';
import {JSONPath} from '@astronautlabs/jsonpath';
import {CredentialSummary, toCredentialSummary} from '@sphereon/ui-components.credential-branding';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIALS_REQUIRED>;

const SSICredentialsRequiredScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {presentationDefinition, format, subjectSyntaxTypesSupported, onSelect, isSendDisabled, onDecline, onBack} = props.route.params;
  const [allUniqueCredentials, setAllUniqueCredentials] = useState<Array<UniqueVerifiableCredential> | null>(null);
  const [allOriginalCredentials, setAllOriginalCredentials] = useState<Array<OriginalVerifiableCredential>>([]);
  const [userSelectedCredentials, setUserSelectedCredentials] = useState(new Map<string, Array<UniqueVerifiableCredential>>());
  const [pexFilteredCredentials, setPexFilteredCredentials] = useState(new Map<string, Array<UniqueVerifiableCredential>>());
  const [matchingDescriptors, setMatchingDescriptors] = useState(new Map<InputDescriptorV1 | InputDescriptorV2, boolean>());
  const pex: PEX = new PEX();

  useBackHandler((): boolean => {
    if (onBack) {
      void onBack();
      // make sure event stops here
      return true;
    }

    // FIXME for some reason returning false does not execute default behaviour
    navigation.goBack();
    return true;
  });

  useEffect(() => {
    getVerifiableCredentialsFromStorage().then((uniqueVCs: Array<UniqueVerifiableCredential>) => {
      // We need to go to a wrapped VC first to get an actual original Verifiable Credential in JWT format, as they are stored with a special Proof value in Veramo
      setAllUniqueCredentials(uniqueVCs);
      console.log(`unique creds length:` + uniqueVCs.length);
    });
    setMatchingDescriptors(
      new Map(
        presentationDefinition.input_descriptors.map((inputDescriptor: InputDescriptorV1 | InputDescriptorV2) => {
          return [inputDescriptor, false];
        }),
      ),
    );
  }, []);

  useEffect(() => {
    if (!allUniqueCredentials) {
      setAllOriginalCredentials([]);
    } else {
      setAllOriginalCredentials(
        allUniqueCredentials.map(uniqueVC =>
          CredentialMapper.storedCredentialToOriginalFormat(uniqueVC.verifiableCredential as OriginalVerifiableCredential),
        ),
      );
    }
    console.log(`orig creds length:` + allOriginalCredentials.length);
  }, [allUniqueCredentials]);

  useEffect((): void => {
    // FIXME we need to have one source for these credentials as then all the data is always available
    // getVerifiableCredentialsFromStorage().then((uniqueVCs: Array<UniqueVerifiableCredential>) => {
    //   // We need to go to a wrapped VC first to get an actual original Verifiable Credential in JWT format, as they are stored with a special Proof value in Veramo
    //   const originalVcs: Array<OriginalVerifiableCredential> = uniqueVCs.map(
    //     (uniqueVC: UniqueVerifiableCredential) =>
    //       CredentialMapper.toWrappedVerifiableCredential(uniqueVC.verifiableCredential as OriginalVerifiableCredential).original,
    //   );
    if (!allOriginalCredentials || !allUniqueCredentials || !presentationDefinition) {
      return;
    }
    const pexMatchingVCs: Map<string, Array<UniqueVerifiableCredential>> = new Map<string, Array<UniqueVerifiableCredential>>();
    presentationDefinition.input_descriptors.forEach((inputDescriptor: InputDescriptorV1 | InputDescriptorV2) => {
      const presentationDefinition: IPresentationDefinition = {
        id: inputDescriptor.id,
        // @ts-ignore
        input_descriptors: [inputDescriptor],
      };
      const selectResult: SelectResults = pex.selectFrom(presentationDefinition, allOriginalCredentials, {
        restrictToFormats: format,
        restrictToDIDMethods: subjectSyntaxTypesSupported,
      });
      if (selectResult.areRequiredCredentialsPresent === Status.ERROR) {
        console.debug('pex.selectFrom returned errors:\n', JSON.stringify(selectResult.errors));
      }
      const matchedVCs: Array<UniqueVerifiableCredential> =
        selectResult.matches && selectResult.verifiableCredential
          ? selectResult.matches
              .map((match: SubmissionRequirementMatch) => {
                const matchedVC = JSONPath.query(selectResult, match.vc_path[0]); // TODO Can we have multiple vc_path elements for a single match?
                if (matchedVC && matchedVC.length > 0) {
                  return getMatchingUniqueVerifiableCredential(allUniqueCredentials!, matchedVC[0]);
                }
              })
              .filter((matchedVC: UniqueVerifiableCredential | undefined): matchedVC is UniqueVerifiableCredential => !!matchedVC) // filter out the undefined (should not happen)
          : [];
      pexMatchingVCs.set(inputDescriptor.id, matchedVCs);
    });
    setPexFilteredCredentials(pexMatchingVCs);
    // });
    console.log(`pex desc length:` + pexMatchingVCs.size);
  }, [presentationDefinition, allUniqueCredentials, allOriginalCredentials]);

  useEffect((): void => {
    const selectedVCsPerDescriptor: Map<string, Array<UniqueVerifiableCredential>> = new Map<string, Array<UniqueVerifiableCredential>>();
    presentationDefinition.input_descriptors.forEach((inputDescriptor: InputDescriptorV1 | InputDescriptorV2) =>
      selectedVCsPerDescriptor.set(inputDescriptor.id, []),
    );
    setUserSelectedCredentials(selectedVCsPerDescriptor);
  }, [presentationDefinition]);

  const onSend = async (): Promise<void> => {
    const {onSend} = props.route.params;
    const selectedVCs: Array<UniqueVerifiableCredential> = getSelectedCredentials();

    await onSend(selectedVCs.map((uniqueVC: UniqueVerifiableCredential) => getOriginalVerifiableCredential(uniqueVC.verifiableCredential)));
  };

  const getSelectedCredentials = (): Array<UniqueVerifiableCredential> => {
    const selectedVCs: Array<Array<UniqueVerifiableCredential>> = [];
    for (const uniqueVCs of userSelectedCredentials.values()) {
      selectedVCs.push(uniqueVCs);
    }

    return selectedVCs.flat();
  };

  const isMatchingPresentationDefinition = (): boolean => {
    console.log(`is matching def=====================`);
    return (
      pex.evaluateCredentials(
        presentationDefinition,
        getSelectedCredentials().map((uniqueVC: UniqueVerifiableCredential) => getOriginalVerifiableCredential(uniqueVC.verifiableCredential)),
      ).areRequiredCredentialsPresent === Status.INFO
    );
  };

  const getDescriptorById = (inputDescriptorId: string): InputDescriptorV1 | InputDescriptorV2 => {
    return [...matchingDescriptors.keys()].find(descriptor => descriptor.id === inputDescriptorId)!;
  };
  const onItemPress = async (
    inputDescriptorId: string,
    inputDescriptorVCs: Array<UniqueVerifiableCredential>,
    inputDescriptorPurpose?: string,
  ): Promise<void> => {
    // FIXME we need to have one source for these credentials as then all the data is always available
    const vcHashes = inputDescriptorVCs.map((uniqueCredential: UniqueVerifiableCredential): {vcHash: string} => ({
      vcHash: uniqueCredential.hash,
    }));
    const credentialsBranding: Array<ICredentialBranding> = await ibGetCredentialBranding({filter: vcHashes});

    const credentialSelection = await Promise.all(
      inputDescriptorVCs.map(async (uniqueVC: UniqueVerifiableCredential) => {
        // FIXME we need to have one source for these credentials as then all the data is always available
        const credentialBranding: ICredentialBranding | undefined = credentialsBranding.find(
          (branding: ICredentialBranding): boolean => branding.vcHash === uniqueVC.hash,
        );
        const credentialSummary: CredentialSummary = await toCredentialSummary(uniqueVC, credentialBranding?.localeBranding);
        const rawCredential: OriginalVerifiableCredential = getOriginalVerifiableCredential(uniqueVC.verifiableCredential);
        const isSelected: boolean = userSelectedCredentials
          .get(inputDescriptorId)!
          .some(
            (matchedVC: UniqueVerifiableCredential) =>
              matchedVC.verifiableCredential.id === uniqueVC.verifiableCredential.id ||
              matchedVC.verifiableCredential.proof === uniqueVC.verifiableCredential.proof,
          );
        return {
          hash: credentialSummary.hash,
          id: credentialSummary.id,
          credential: credentialSummary,
          rawCredential: rawCredential,
          isSelected,
        };
      }),
    );

    const onSelectCredential = async (hashes: Array<string>): Promise<void> => {
      const uniquePEXFilteredVCs: Array<UniqueVerifiableCredential> = pexFilteredCredentials
        .get(inputDescriptorId)!
        .filter((vc: UniqueVerifiableCredential) => hashes.includes(vc.hash));
      const newSelection = new Map(userSelectedCredentials.entries());
      newSelection.set(inputDescriptorId, uniquePEXFilteredVCs);
      const inputDescriptor = getDescriptorById(inputDescriptorId);
      console.log(`input descriptor: ${inputDescriptor.id} pex.evaluate!!!!!`);
      const evaluationResult =
        pex.evaluateCredentials(
          {
            id: inputDescriptor.id,
            // @ts-ignore
            input_descriptors: [inputDescriptor],
          },
          uniquePEXFilteredVCs.map((uniqueVC: UniqueVerifiableCredential) => getOriginalVerifiableCredential(uniqueVC.verifiableCredential)),
        ).areRequiredCredentialsPresent === Status.INFO;
      const matchingDescriptorsCopy = new Map(matchingDescriptors);
      matchingDescriptorsCopy.set(inputDescriptor, evaluationResult);
      setMatchingDescriptors(matchingDescriptorsCopy);
      setUserSelectedCredentials(newSelection);

      if (onSelect) {
        const selectedVCs: Array<Array<UniqueVerifiableCredential>> = [];
        for (const uniqueVCs of newSelection.values()) {
          selectedVCs.push(uniqueVCs);
        }
        await onSelect(
          selectedVCs.flat().map((uniqueVC: UniqueVerifiableCredential) => getOriginalVerifiableCredential(uniqueVC.verifiableCredential)),
        );
      }
    };

    props.navigation.navigate(ScreenRoutesEnum.CREDENTIALS_SELECT, {
      credentialSelection,
      purpose: inputDescriptorPurpose,
      onSelect: onSelectCredential,
    });
  };

  // TODO add support for multiple versions of pex, currently using V1
  const renderItem = (itemInfo: ListRenderItemInfo<InputDescriptorV1 | InputDescriptorV2>): JSX.Element => {
    console.log(`rendering item ${itemInfo.item.id}`);
    const descriptorVCs = pexFilteredCredentials.get(itemInfo.item.id);
    const onPress =
      !descriptorVCs || descriptorVCs.length === 0 ? undefined : () => onItemPress(itemInfo.item.id, descriptorVCs, itemInfo.item.purpose);

    const checkIsMatching = (
      itemInfo: ListRenderItemInfo<InputDescriptorV1 | InputDescriptorV2>,
      selectedCredentials: Map<string, Array<UniqueVerifiableCredential>>,
    ): boolean => {
      if (!selectedCredentials.has(itemInfo.item.id)) {
        return false;
      }
      const selectedDescriptorCredentials = selectedCredentials.get(itemInfo.item.id);
      if (!selectedDescriptorCredentials) {
        return false;
      }

      /*const credentials = selectedDescriptorCredentials.map((uniqueVC: UniqueVerifiableCredential) =>
        getOriginalVerifiableCredential(uniqueVC.verifiableCredential),
      );*/
      return matchingDescriptors.get(itemInfo.item) ?? false;

      /*return (
        pex.evaluateCredentials(
          {
            id: itemInfo.item.id,
            input_descriptors: [itemInfo.item],
          },
          credentials,
        ).areRequiredCredentialsPresent === Status.INFO
      );*/
    };

    return (
      <SSICredentialRequiredViewItem
        id={itemInfo.item.id}
        title={itemInfo.item.name || itemInfo.item.id}
        purpose={itemInfo.item.purpose}
        available={pexFilteredCredentials.has(itemInfo.item.id) ? pexFilteredCredentials.get(itemInfo.item.id) : undefined}
        selected={userSelectedCredentials.has(itemInfo.item.id) ? userSelectedCredentials.get(itemInfo.item.id)! : []}
        isMatching={checkIsMatching(itemInfo, userSelectedCredentials)}
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
            caption: translate('action_share_label'),
            // We do a quick check to see if any of the descriptors are not matching. The machine has a guard, doing a pex check anyway
            disabled: [...matchingDescriptors.values()].includes(false),
            // disabled: isSendDisabled ? isSendDisabled() : !isMatchingPresentationDefinition(),
            onPress: onSend,
          }}
        />
      </ButtonContainer>
    </Container>
  );
};

export default SSICredentialsRequiredScreen;
