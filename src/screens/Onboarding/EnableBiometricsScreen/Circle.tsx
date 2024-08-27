import {useMemo} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {LinearGradient as Gradient} from 'expo-linear-gradient';
import FaceIDIcon from '../../../components/assets/icons/FaceIDIcon';
import AndroidFingerprintIcon from '../../../components/assets/icons/AndroidFingerprintIcon';

type CircleWithBorderProps = {
  size: number;
  borderWidth: number;
  borderColors: string[];
  backgroundColors: string[];
  icon?: React.ReactNode;
  style?: any;
};

const styles = StyleSheet.create({
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const CircleWithBorder = (props: CircleWithBorderProps) => {
  const {size, borderWidth, borderColors, icon, backgroundColors} = props;

  const innerSize = useMemo(() => {
    return size - 2 * borderWidth;
  }, [size, borderWidth]);

  const isIos = Platform.OS === 'ios';

  return (
    <Gradient
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        ...styles.center,
      }}
      colors={borderColors}>
      <Gradient
        colors={backgroundColors}
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          ...styles.center,
        }}>
        {icon ?? isIos ? <FaceIDIcon size={(2 * size) / 7} color="white" /> : <AndroidFingerprintIcon size={(2 * size) / 7} color="white" />}
      </Gradient>
    </Gradient>
  );
};

export {CircleWithBorder};
