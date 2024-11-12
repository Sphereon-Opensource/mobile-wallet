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
          onClose={onClose}
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
          primaryButton={primaryButton}
          secondaryButton={secondaryButton}
        />
      </ModalContentContainer>
    </Container>
  );
};

export default SSIPopupModal;
