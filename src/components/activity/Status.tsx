import styled from 'styled-components/native';
import {SSITextH3Styled, SSITextH4LightStyled} from '../../styles/components';
import {Activity, ActivityActionResult} from '../../types';
import {getActivityStatusText} from '../../utils/activity';

type Props = {
  activity: Activity;
};

type Colors = {
  background: string;
  title: string;
  description: string;
};

const colorMap: Record<ActivityActionResult, Colors> = {
  [ActivityActionResult.SUCCESS]: {background: '#00C2491F', title: '#BAE3CB', description: '#A8D3BB'},
  [ActivityActionResult.DECLINE]: {background: '#D745001F', title: '#E7C9BB', description: '#D7A996'},
};

const Container = styled.View`
  padding-horizontal: 16px;
  padding-vertical: 12px;
  border-radius: 4px;
  flex-direction: row;
  gap: 16px;
  margin-horizontal: 8px;
`;

const TextContainer = styled.View`
  flex: 1;
  gap: 4px;
`;

const Status = ({activity}: Props) => {
  const {title, description, icon} = getActivityStatusText(activity);
  const colors = colorMap[activity.result];
  return (
    <Container style={{backgroundColor: colors.background}}>
      {icon}
      <TextContainer>
        <SSITextH3Styled style={{color: colors.title}}>{title}</SSITextH3Styled>
        {description && <SSITextH4LightStyled style={{color: colors.description}}>{description}</SSITextH4LightStyled>}
      </TextContainer>
    </Container>
  );
};

export default Status;
