import styled from 'styled-components/native';
import {SSITextH4LightStyled} from '../../../styles/components';
import {View} from 'react-native';
import SSIBackIcon from '../../../components/assets/icons/SSIBackIcon';

const NavigationButtonContainer = styled.Pressable`
  width: 100%;
  padding: 10px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type NavigationButtonProps = {
  onPress: () => void;
  label: string;
};

export const NavigationButton = (props: NavigationButtonProps) => {
  const {onPress, label} = props;
  return (
    <NavigationButtonContainer onPress={onPress} style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}>
      <SSITextH4LightStyled style={{flex: 1}}>{label}</SSITextH4LightStyled>
      <View>
        <SSIBackIcon
          style={{
            transform: [
              {
                rotate: '180deg',
              },
            ],
          }}
          color="white"
        />
      </View>
    </NavigationButtonContainer>
  );
};
