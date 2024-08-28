import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {LinearGradient as Gradient} from 'expo-linear-gradient';
import BiometricsIcon from '../../../components/assets/icons/BiometricsIcon';

type CircleWithBorderProps = {
  size: number;
  borderWidth: number;
  borderColors: string[];
  backgroundColors: string[];
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
  const {size, borderWidth, borderColors, backgroundColors} = props;

  const innerSize = useMemo(() => {
    return size - 2 * borderWidth;
  }, [size, borderWidth]);

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
        colors={borderColors}
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          ...styles.center,
        }}>
        <BiometricsIcon size={(2 * size) / 7} color="white" />
      </Gradient>
    </Gradient>
  );
};

export {CircleWithBorder};
