import React, {FC} from 'react';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

export interface IProps {
  primaryColor: string;
  secondaryColor: string;
}

const SSIHomeIcon: FC<IProps> = (props: IProps): JSX.Element => {
  return (
    <Svg width="18" height="22" viewBox="0 0 18 22" fill="none">
      <Path
        d="M1.93132 8.68397C1.72638 8.88891 1.56024 9.29185 1.56024 9.57087V18.9408C1.56024 19.2257 1.78898 19.4566 2.07852 19.4566H15.6042C15.8904 19.4566 16.1225 19.2199 16.1225 18.9408V9.57087C16.1225 9.28599 15.9567 8.8893 15.7514 8.68397L9.21244 2.14502C9.0075 1.94007 8.6756 1.93969 8.47028 2.14502L1.93132 8.68397ZM0 9.45128C0 8.87552 0.330455 8.07832 0.738602 7.67018L8.10276 0.306024C8.51067 -0.101894 9.17181 -0.102122 9.57996 0.306024L16.9441 7.67018C17.352 8.0781 17.6827 8.87246 17.6827 9.45128V19.9744C17.6827 20.5501 17.2188 21.0169 16.6426 21.0169H1.04012C0.465677 21.0169 0 20.5532 0 19.9744V9.45128Z"
        fill="url(#paint0_linear_250:3487)"
      />
      <Defs>
        <LinearGradient id="paint0_linear_250:3487" x1="0" y1="0" x2="20.7072" y2="17.4221" gradientUnits="userSpaceOnUse">
          <Stop stopColor={props.primaryColor} />
          <Stop offset="1" stopColor={props.secondaryColor} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

export default SSIHomeIcon;
