import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';

import SSIAlert from '../../components/messageBoxes/alerts/SSIAlert';
import {translate} from '../../localization/Localization';
import {SSIBasicModalContainerStyled as Container, SSIAlertModalContentContainerStyled as ModalContentContainer} from '../../styles/components';
import {MainRoutesEnum, StackParamList} from '../../types';
import {SecondaryButton} from '@sphereon/ui-components.ssi-react-native';

type Props = NativeStackScreenProps<StackParamList, MainRoutesEnum.ALERT_MODAL>;

const SSIAlertModal: FC<Props> = (props: Props): JSX.Element => {
  const {message, buttons, showCancel = true} = props.route.params;

  const onCancel = async (): Promise<void> => {
    props.navigation.goBack();
  };

  return (
    <Container>
      <ModalContentContainer>
        <SSIAlert message={message} buttons={buttons} />
        {showCancel ? (
          <SecondaryButton
            caption={translate('action_cancel_label')}
            onPress={onCancel}
            // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
            style={{height: 42, flex: 1}}
          />
        ) : null}
      </ModalContentContainer>
    </Container>
  );
};

export default SSIAlertModal;
