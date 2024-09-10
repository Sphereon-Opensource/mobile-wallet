import {fontColors} from '@sphereon/ui-components.core';
import React from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

export interface IProps {
  width?: number;
  height?: number;
  color?: ColorValue;
}

const SSIAddressIcon = (props: IProps) => {
  const {width = 20, height = 16, color = fontColors.light} = props;
  return (
    <View style={{width, height}}>
      <Svg width="100%" height="100%" viewBox="0 0 20 16" fill="none">
        <Path
          d="M19.5372 8.10548L18.2096 6.69729L14.1766 2.42904C14.1547 2.40528 14.1285 2.38589 14.0993 2.37191H14.0691C14.0306 2.35667 13.9895 2.3487 13.9481 2.34838H7.64991V1.00405C7.64991 0.914917 7.6145 0.829433 7.55148 0.766405C7.48845 0.703377 7.40297 0.667969 7.31383 0.667969C7.2247 0.667969 7.13921 0.703377 7.07618 0.766405C7.01316 0.829433 6.97775 0.914917 6.97775 1.00405V2.34838H6.08713C6.04186 2.34855 5.99709 2.35787 5.9555 2.37578C5.91392 2.39368 5.87639 2.4198 5.84515 2.45257L0.467825 8.13237C0.422507 8.1799 0.392111 8.23968 0.380393 8.3043C0.368675 8.36893 0.376149 8.43557 0.401891 8.49599C0.427633 8.55641 0.470516 8.60797 0.525239 8.64429C0.579962 8.68061 0.644127 8.7001 0.709805 8.70035H1.71805V14.9952C1.71805 15.0843 1.75346 15.1698 1.81649 15.2328C1.87952 15.2958 1.965 15.3313 2.05414 15.3313H17.9576C18.0467 15.3313 18.1322 15.2958 18.1952 15.2328C18.2582 15.1698 18.2937 15.0843 18.2937 14.9952V7.77276L19.0465 8.56591C19.0778 8.5997 19.1158 8.62668 19.158 8.64519C19.2002 8.66369 19.2457 8.67331 19.2918 8.67346C19.3772 8.67226 19.4589 8.63861 19.5204 8.57936C19.5852 8.51864 19.6234 8.43469 19.6266 8.34589C19.6297 8.25708 19.5976 8.17064 19.5372 8.10548ZM6.23501 2.99366H6.97775V4.33799C6.97775 4.42713 7.01316 4.51261 7.07618 4.57564C7.13921 4.63867 7.2247 4.67407 7.31383 4.67407C7.40297 4.67407 7.48845 4.63867 7.55148 4.57564C7.6145 4.51261 7.64991 4.42713 7.64991 4.33799V2.99366H13.1482L13.1113 3.03063L8.4061 8.00129H1.49288L6.23501 2.99366ZM2.37678 8.67346H8.55062C8.59645 8.67374 8.64186 8.66464 8.68406 8.64673C8.72625 8.62881 8.76433 8.60245 8.79596 8.56927L9.5555 7.7694V14.6591H2.37678V8.67346ZM12.9163 14.6557V11.2949H14.9328V14.6557H12.9163ZM17.6215 14.6557H15.605V10.9588C15.605 10.8697 15.5696 10.7842 15.5066 10.7212C15.4435 10.6581 15.358 10.6227 15.2689 10.6227H12.5802C12.4911 10.6227 12.4056 10.6581 12.3426 10.7212C12.2796 10.7842 12.2442 10.8697 12.2442 10.9588V14.6557H10.2277V7.06362L13.9246 3.1449L17.6215 7.06026V14.6557Z"
          fill={color}
        />
        <Path
          d="M7.87469 10.623H4.05679C3.96765 10.623 3.88217 10.6585 3.81914 10.7215C3.75611 10.7845 3.7207 10.87 3.7207 10.9591V12.9756C3.7207 13.0648 3.75611 13.1502 3.81914 13.2133C3.88217 13.2763 3.96765 13.3117 4.05679 13.3117H7.87469C7.96382 13.3117 8.0493 13.2763 8.11233 13.2133C8.17536 13.1502 8.21077 13.0648 8.21077 12.9756V10.9591C8.21077 10.87 8.17536 10.7845 8.11233 10.7215C8.0493 10.6585 7.96382 10.623 7.87469 10.623ZM7.5386 12.6395H4.39287V11.2952H7.5386V12.6395Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default SSIAddressIcon;
