import React, {FC} from 'react';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

export interface IProps {
  primaryColor: string;
  secondaryColor: string;
}

const CredentialCatalogIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const {primaryColor, secondaryColor} = props;

  return (
    <Svg width="23" height="22" viewBox="0 0 23 22" fill="none">
      <Path
        d="M3.16276 1.6542C2.5693 1.6542 2.08633 2.132 2.08633 2.72377V8.85425C2.08633 9.44602 2.5693 9.92382 3.16276 9.92382H9.33899C9.93245 9.92382 10.4154 9.44602 10.4154 8.85425V2.72377C10.4154 2.132 9.93245 1.6542 9.33899 1.6542H3.16276ZM3.00395 2.72377C3.00395 2.63837 3.074 2.56725 3.16276 2.56725H9.33899C9.42776 2.56725 9.4978 2.63837 9.4978 2.72377V8.85425C9.4978 8.93965 9.42776 9.01077 9.33899 9.01077H3.16276C3.074 9.01077 3.00395 8.93965 3.00395 8.85425V2.72377Z"
        fill="url(#paint0_linear_953_25967)"
        stroke="url(#paint1_linear_953_25967)"
        stroke-width="0.3"
      />
      <Path
        d="M1.92643 12.0761C1.33298 12.0761 0.85 12.5539 0.85 13.1456V20.5022C0.85 21.094 1.33298 21.5718 1.92643 21.5718H9.33791C9.93137 21.5718 10.4143 21.094 10.4143 20.5022V13.1456C10.4143 12.5539 9.93137 12.0761 9.33791 12.0761H1.92643ZM1.76762 13.1456C1.76762 13.0602 1.83767 12.9891 1.92643 12.9891H9.33791C9.42668 12.9891 9.49672 13.0602 9.49672 13.1456V20.5022C9.49672 20.5876 9.42668 20.6587 9.33791 20.6587H1.92643C1.83767 20.6587 1.76762 20.5876 1.76762 20.5022V13.1456Z"
        fill="url(#paint2_linear_953_25967)"
        stroke="url(#paint3_linear_953_25967)"
        stroke-width="0.3"
      />
      <Path
        d="M13.6608 0.428125C13.0674 0.428125 12.5844 0.905925 12.5844 1.4977V8.85427C12.5844 9.44604 13.0674 9.92384 13.6608 9.92384H21.0723C21.6657 9.92384 22.1487 9.44604 22.1487 8.85427V1.4977C22.1487 0.905925 21.6657 0.428125 21.0723 0.428125H13.6608ZM13.502 1.4977C13.502 1.4123 13.572 1.34117 13.6608 1.34117H21.0723C21.1611 1.34117 21.2311 1.4123 21.2311 1.4977V8.85427C21.2311 8.93967 21.1611 9.0108 21.0723 9.0108H13.6608C13.572 9.0108 13.502 8.93967 13.502 8.85427V1.4977Z"
        fill="url(#paint4_linear_953_25967)"
        stroke="url(#paint5_linear_953_25967)"
        stroke-width="0.3"
      />
      <Path
        d="M13.6608 12.0761C13.0674 12.0761 12.5844 12.5539 12.5844 13.1456V19.2761C12.5844 19.8679 13.0674 20.3457 13.6608 20.3457H19.837C20.4305 20.3457 20.9135 19.8679 20.9135 19.2761V13.1456C20.9135 12.5539 20.4305 12.0761 19.837 12.0761H13.6608ZM13.502 13.1456C13.502 13.0602 13.572 12.9891 13.6608 12.9891H19.837C19.9258 12.9891 19.9959 13.0602 19.9959 13.1456V19.2761C19.9959 19.3615 19.9258 19.4326 19.837 19.4326H13.6608C13.572 19.4326 13.502 19.3615 13.502 19.2761V13.1456Z"
        fill="url(#paint6_linear_953_25967)"
        stroke="url(#paint7_linear_953_25967)"
        stroke-width="0.3"
      />
      <Defs>
        <LinearGradient id="paint0_linear_953_25967" x1="2.23633" y1="1.8042" x2="10.2057" y2="9.83307" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient id="paint1_linear_953_25967" x1="2.23633" y1="1.8042" x2="10.2057" y2="9.83307" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient id="paint2_linear_953_25967" x1="1" y1="12.2261" x2="10.1955" y2="21.4902" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient id="paint3_linear_953_25967" x1="1" y1="12.2261" x2="10.1955" y2="21.4902" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient id="paint4_linear_953_25967" x1="12.7344" y1="0.578125" x2="21.9298" y2="9.84221" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient id="paint5_linear_953_25967" x1="12.7344" y1="0.578125" x2="21.9298" y2="9.84221" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient id="paint6_linear_953_25967" x1="12.7344" y1="12.2261" x2="20.7038" y2="20.2549" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient id="paint7_linear_953_25967" x1="12.7344" y1="12.2261" x2="20.7038" y2="20.2549" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

export default CredentialCatalogIcon;
