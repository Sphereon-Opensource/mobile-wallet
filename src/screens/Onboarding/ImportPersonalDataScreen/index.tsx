import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useEffect, useState} from 'react';
import {Image, Keyboard, Platform} from 'react-native';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import AusweisEPinModal from '../components/AusweisEPinModal';
import AusweisScanModal from '../components/AusweisScanModal';
import {
  ImportPersonalDataContainer as Container,
  ImportPersonalDataContentContainer as Content,
  ImportPersonalDataFooter,
  ImportPersonalDataNFCCaptionText,
} from '../../../styles/components';
import VciServiceFunkeCProvider from '../../../providers/authentication/funke/VciServiceFunkeCProvider';
import {EIDFlowState} from '../../../types';
import {delay} from '../../../utils';

const ImportPersonalDataScreen = (props?: any) => {
  const {onAuth} = props?.route?.params ?? {};

  const {onboardingInstance} = useContext(OnboardingContext);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [eIDFlowState, setEIDFlowState] = useState<EIDFlowState | undefined>();
  const [provider, setProvider] = useState<VciServiceFunkeCProvider | undefined>();

  const translationsPath = 'onboarding_pages.import_scan_card';

  const closeAll = () => {
    setShowPin(false);
    setPin('');
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (eIDFlowState?.state === 'ERROR' && (eIDFlowState?.reason === 'card_locked' || eIDFlowState?.message === 'Error in onEnterPin callback')) {
      setShowPin(true);
      setPin('');
    }
  }, [eIDFlowState]);

  useEffect(() => {
    if (pin.length === 0) {
      return;
    }

    const onAuthenticated = async (provider: VciServiceFunkeCProvider): Promise<void> => {
      onboardingInstance.send(OnboardingMachineEvents.SET_FUNKE_PROVIDER, {data: provider});
      // Adding a small delay to let the animation play
      await delay(600);
      onboardingInstance.send(OnboardingMachineEvents.NEXT);
    };

    const onEnterPin = (): string => {
      return pin;
    };

    // Fixme. Move back to C flow after integration into VP flow
    VciServiceFunkeCProvider.initialize({
      onEnterPin,
      onAuthenticated: onAuth ?? onAuthenticated,
      onStateChange: setEIDFlowState,
    }).then((provider: VciServiceFunkeCProvider): void => {
      setProvider(provider);
      void provider.start();
    });
  }, [pin]);

  const onCompletePin = (pin: string): void => {
    setPin(pin);
    setShowPin(false);
    props?.navigation?.setParams({title: translate(`${translationsPath}.nfc_step_title`), subtitle: ''});
  };

  return (
    <Container>
      <Content style={{flex: 1, justifyContent: 'center', paddingTop: pin ? 32 : 0}} onPress={() => closeAll()}>
        <Image source={require('../../../assets/images/scan_card.png')} height={200} width={100} style={{height: 300, width: 200}} />
      </Content>
      <ImportPersonalDataFooter style={{display: 'flex', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20}}>
        {/** Conditionally swapping this button with the text below it
         * for ios since the Ausweis native modal can
         * take a few seconds to show.
         */}
        {!pin && (
          <PrimaryButton
            style={{height: 42, width: '100%'}}
            caption={translate(`${translationsPath}.button_caption`)}
            captionColor={fontColors.light}
            onPress={() => setShowPin(true)}
          />
        )}
        {!!pin && <ImportPersonalDataNFCCaptionText>{translate(`${translationsPath}.nfc_caption`)}</ImportPersonalDataNFCCaptionText>}
      </ImportPersonalDataFooter>
      {Platform.OS === 'android' && !showPin && (
        <AusweisScanModal state={eIDFlowState} progress={eIDFlowState?.progress} onCancel={() => provider?.cancel()} />
      )}
      <AusweisEPinModal
        isVisible={showPin}
        onClose={() => setShowPin(false)}
        onComplete={onCompletePin}
        {...(eIDFlowState?.state === 'ERROR' && {
          errorMessage: (() => {
            if (eIDFlowState?.reason === 'card_locked') {
              return translate(`${translationsPath}.card_locked_message`);
            } else if (eIDFlowState?.message === 'Error in onEnterPin callback') {
              return translate(`${translationsPath}.incorrect_pin_message`);
            } else {
              return eIDFlowState?.message ?? translate(`${translationsPath}.unknown_scan_card_error_message`);
            }
          })(),
        })}
      />
    </Container>
  );
};

export default ImportPersonalDataScreen;
