import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import SSIPopup from '../../components/messageBoxes/popups/SSIPopup';
import {
  SSIBasicContainerStyled as Container,
  SSIErrorScreenContentContainerStyled as ContentContainer,
  SSIPopupModalDetailsModalContainerStyled as ExtraDetailsContainer,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {useBackHandler} from '@react-native-community/hooks';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ERROR>;

const SSIErrorScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {onClose, onBack, image, title, titleBadge, details, extraDetails, detailsPopup, primaryButton, secondaryButton} = props.route.params;
  const [showExtraDetails, setShowExtraDetails] = React.useState(false);

  console.error(`ERROR Screen: ${JSON.stringify(details)}`);
  if (extraDetails) {
    console.error(`ERROR details:\n${JSON.stringify(extraDetails)}`);
  }
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

  const onShowExtraDetails = async (): Promise<void> => {
    setShowExtraDetails(true);
  };

  const onHideExtraDetails = async (): Promise<void> => {
    setShowExtraDetails(false);
  };

  return (
    <Container>
      <ContentContainer>
        {showExtraDetails && detailsPopup && (
          <ExtraDetailsContainer>
            <SSIPopup
              onClose={onHideExtraDetails}
              title={detailsPopup.title}
              details={detailsPopup.details}
              extraDetails={detailsPopup.extraDetails}
              darkMode
            />
          </ExtraDetailsContainer>
        )}
        <SSIPopup
          onClose={onClose}
          image={image}
          title={title}
          titleBadge={titleBadge}
          details={details}
          extraDetails={extraDetails}
          {...(detailsPopup && {
            detailsButton: {
              caption: detailsPopup.buttonCaption,
              onPress: onShowExtraDetails,
            },
          })}
          primaryButton={primaryButton}
          secondaryButton={secondaryButton}
          darkMode
        />
      </ContentContainer>
    </Container>
  );
};

export default SSIErrorScreen;
