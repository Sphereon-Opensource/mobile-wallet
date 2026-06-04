import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';

import SSIPopup from '../../components/messageBoxes/popups/SSIPopup';
import {
  SSIBasicModalContainerStyled as Container,
  SSIPopupModalDetailsModalContainerStyled as ExtraDetailsContainer,
  SSIPopupModalContentContainerStyled as ModalContentContainer,
} from '../../styles/components';
import {MainRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, MainRoutesEnum.POPUP_MODAL>;

const SSIPopupModal: FC<Props> = (props: Props): JSX.Element => {
  const {onClose, image, title, titleBadge, details, extraDetails, detailsPopup, primaryButton, secondaryButton, input} = props.route.params;
  const [showExtraDetails, setShowExtraDetails] = React.useState(false);

  // Only dismiss if this modal is still the focused (top) route. If the button's onPress already
  // navigated away (e.g. a state machine advanced the flow and navigated to a route *below* this
  // modal, which pops the modal), an unguarded goBack() would pop the screen underneath instead —
  // briefly revealing it (e.g. the QR scanner remounting its camera) before the next screen mounts.
  const dismiss = async () => {
    if (props.navigation.isFocused()) {
      props.navigation.goBack();
    }
  };

  const wrapWithDismiss = (button: typeof primaryButton) =>
    button
      ? {
          ...button,
          onPress: async () => {
            await button.onPress();
            dismiss();
          },
        }
      : undefined;

  const onShowExtraDetails = async (): Promise<void> => {
    setShowExtraDetails(true);
  };

  const onCloseExtraDetails = async (): Promise<void> => {
    setShowExtraDetails(false);
  };

  return (
    <Container>
      <ModalContentContainer>
        {showExtraDetails && detailsPopup && (
          <ExtraDetailsContainer>
            <SSIPopup
              onClose={onCloseExtraDetails}
              title={detailsPopup.title}
              details={detailsPopup.details}
              extraDetails={detailsPopup.extraDetails}
            />
          </ExtraDetailsContainer>
        )}

        <SSIPopup
          onClose={onClose ?? dismiss}
          image={image}
          title={title}
          titleBadge={titleBadge}
          details={details}
          input={input}
          extraDetails={extraDetails}
          {...(detailsPopup && {
            detailsPopup: {
              caption: detailsPopup.buttonCaption,
              onPress: onShowExtraDetails,
            },
          })}
          primaryButton={wrapWithDismiss(primaryButton)}
          secondaryButton={wrapWithDismiss(secondaryButton)}
        />
      </ModalContentContainer>
    </Container>
  );
};

export default SSIPopupModal;
