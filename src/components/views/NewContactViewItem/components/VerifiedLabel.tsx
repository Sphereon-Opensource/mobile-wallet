import SSICheckmarkIcon from '../../../../components/assets/icons/SSICheckmarkIcon';
import {VerifiedLabelContainer, VerifiedLabelIconContainer, VerifiedLabelText} from '../../../../styles/components/components/VerifiedLabel';

export const VerifiedLabel = () => {
  return (
    <VerifiedLabelContainer>
      <VerifiedLabelIconContainer>
        <SSICheckmarkIcon color="white" width={8} height={8} />
      </VerifiedLabelIconContainer>
      <VerifiedLabelText>Verified</VerifiedLabelText>
    </VerifiedLabelContainer>
  );
};
