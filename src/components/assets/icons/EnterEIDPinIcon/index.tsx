import {ColorValue, View} from 'react-native';
import Svg, {Defs, G, LinearGradient, Mask, Path, Rect, Stop} from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
}

const EnterEIDPinIcon = (props: Props) => {
  const {width = 281, height = 270} = props;
  return (
    <View style={{width, height}}>
      <Svg width="100%" height="100%" fill="none">
        <Rect width={135.407} height={85} x={71} y={109} fill="url(#Component_15_svg__a)" rx={8} />
        <Rect width={22.721} height={22.721} x={79.406} y={117.406} stroke="#FBFBFB" rx={3.5} />
        <Path
          fill="#FBFBFB"
          fillRule="evenodd"
          d="M90.299 120.873a7.91 7.91 0 0 0-7.442 7.9 7.91 7.91 0 0 0 7.442 7.9v-3.008a4.91 4.91 0 0 1-4.442-4.892 4.91 4.91 0 0 1 4.442-4.892zM91.23 120.858a7.91 7.91 0 0 1 7.442 7.901 7.91 7.91 0 0 1-7.441 7.9v-3.009a4.91 4.91 0 0 0 4.44-4.891 4.91 4.91 0 0 0-4.44-4.892z"
          clipRule="evenodd"
        />
        <Path
          fill="#5613CF"
          d="M121.408 122.837h42.5v3.953h-42.5zM121.408 128.769h68.198v3.953h-68.198zM121.408 170.279h68.198v3.953h-68.198zM121.408 176.21h32.616v3.953h-32.616zM121.408 146.558h14.826v3.953h-14.826zM121.408 152.489h23.721v3.953h-23.721zM161.93 146.558h14.826v3.953H161.93zM161.93 152.489h27.674v3.953H161.93z"
        />
        <Mask
          id="Component_15_svg__b"
          width={70}
          height={104}
          x={211}
          y={54}
          maskUnits="userSpaceOnUse"
          style={{
            maskType: 'alpha',
          }}>
          <Path
            fill="#fff"
            fillRule="evenodd"
            d="M227 56a2 2 0 0 1 2-2h50a2 2 0 0 1 2 2v100a2 2 0 0 1-2 2h-66a2 2 0 1 1 0-4h64V58h-48a2 2 0 0 1-2-2"
            clipRule="evenodd"
          />
        </Mask>
        <G fill="#7A4DE9" mask="url(#Component_15_svg__b)">
          <Path d="M227 54h1v4h-1z" opacity={0.4} />
          <Path d="M227 54h1v4h-1z" opacity={0.6} />
          <Path d="M227 54h1v4h-1z" />
        </G>
        <Mask
          id="Component_15_svg__c"
          width={70}
          height={104}
          x={0}
          y={54}
          maskUnits="userSpaceOnUse"
          style={{
            maskType: 'alpha',
          }}>
          <Path
            fill="#fff"
            fillRule="evenodd"
            d="M54 56a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v100a2 2 0 0 0 2 2h66a2 2 0 1 0 0-4H4V58h48a2 2 0 0 0 2-2"
            clipRule="evenodd"
          />
        </Mask>
        <G fill="#7A4DE9" mask="url(#Component_15_svg__c)">
          <Path d="M54 54h-1v4h1z" opacity={0.4} />
          <Path d="M54 54h-1v4h1z" opacity={0.6} />
          <Path d="M54 54h-1v4h1z" />
        </G>
        <Rect width={22.658} height={29} x={58.5} y={39.783} fill="#FBFBFB" fillOpacity={0.8} rx={3.5} />
        <Rect width={22.658} height={29} x={58.5} y={39.783} stroke="#8D9099" rx={3.5} />
        <Path
          fill="#8D9099"
          d="m65.828 54.052.557-1.82q1.925.718 2.796 1.243-.23-2.32-.242-3.192h1.755q-.037 1.269-.279 3.18a20 20 0 0 1 2.856-1.231l.557 1.82q-1.538.54-3.014.718.74.68 2.082 2.423l-1.452 1.09q-.701-1.013-1.658-2.756-.896 1.808-1.574 2.756l-1.428-1.09q1.404-1.833 2.01-2.423a42 42 0 0 1-2.966-.718"
        />
        <Rect width={22.658} height={29} x={114.42} y={39.784} fill="#FBFBFB" fillOpacity={0.8} rx={3.5} />
        <Rect width={22.658} height={29} x={114.42} y={39.784} stroke="#8D9099" rx={3.5} />
        <Path
          fill="#8D9099"
          d="m121.748 54.053.557-1.82q1.925.718 2.796 1.244-.23-2.321-.243-3.193h1.755q-.036 1.269-.278 3.18a20 20 0 0 1 2.856-1.231l.557 1.82a14.4 14.4 0 0 1-3.014.718q.74.68 2.082 2.423l-1.452 1.09q-.702-1.013-1.658-2.756-.896 1.808-1.574 2.756l-1.428-1.09q1.404-1.833 2.009-2.423a42 42 0 0 1-2.965-.718"
        />
        <Rect width={22.658} height={29} x={170.338} y={39.783} fill="#FBFBFB" fillOpacity={0.8} rx={3.5} />
        <Rect width={22.658} height={29} x={170.338} y={39.783} stroke="#8D9099" rx={3.5} />
        <Path
          fill="#8D9099"
          d="m177.666 54.052.557-1.82q1.925.718 2.796 1.243-.23-2.32-.243-3.192h1.755q-.036 1.269-.278 3.18a20 20 0 0 1 2.856-1.231l.557 1.82a14.4 14.4 0 0 1-3.014.718q.739.68 2.082 2.423l-1.452 1.09q-.702-1.013-1.658-2.756-.896 1.808-1.574 2.756l-1.428-1.09q1.404-1.833 2.009-2.423a42 42 0 0 1-2.965-.718"
        />
        <Rect width={22.658} height={29} x={86.459} y={39.783} fill="#FBFBFB" fillOpacity={0.8} rx={3.5} />
        <Rect width={22.658} height={29} x={86.459} y={39.783} stroke="#8D9099" rx={3.5} />
        <Path
          fill="#8D9099"
          d="m93.787 54.052.557-1.82q1.925.718 2.796 1.243-.23-2.32-.243-3.192h1.755q-.036 1.269-.278 3.18a20 20 0 0 1 2.856-1.231l.557 1.82q-1.538.54-3.014.718.74.68 2.082 2.423l-1.452 1.09q-.701-1.013-1.658-2.756-.896 1.808-1.574 2.756l-1.428-1.09q1.404-1.833 2.01-2.423a42 42 0 0 1-2.966-.718"
        />
        <Rect width={22.658} height={29} x={142.377} y={39.783} fill="#FBFBFB" fillOpacity={0.8} rx={3.5} />
        <Rect width={22.658} height={29} x={142.377} y={39.783} stroke="#8D9099" rx={3.5} />
        <Path
          fill="#8D9099"
          d="m149.705 54.052.557-1.82q1.925.718 2.796 1.243-.23-2.32-.242-3.192h1.754q-.036 1.269-.278 3.18a20 20 0 0 1 2.856-1.231l.557 1.82a14.4 14.4 0 0 1-3.014.718q.74.68 2.082 2.423l-1.452 1.09q-.702-1.013-1.658-2.756-.896 1.808-1.574 2.756l-1.428-1.09q1.404-1.833 2.009-2.423a42 42 0 0 1-2.965-.718"
        />
        <Rect width={22.658} height={29} x={198.918} y={39.5} fill="#FBFBFB" fillOpacity={0.8} rx={3.5} />
        <Rect width={22.658} height={29} x={198.918} y={39.5} stroke="#8D9099" rx={3.5} />
        <Path
          fill="#8D9099"
          d="m206.246 53.77.557-1.821q1.924.718 2.796 1.243-.23-2.32-.242-3.192h1.754q-.036 1.269-.278 3.18a20 20 0 0 1 2.856-1.231l.557 1.82a14.4 14.4 0 0 1-3.014.718q.74.679 2.082 2.423L211.862 58q-.702-1.013-1.658-2.756-.896 1.808-1.574 2.756l-1.428-1.09q1.404-1.833 2.009-2.423a42 42 0 0 1-2.965-.718"
        />
        <Defs>
          <LinearGradient id="Component_15_svg__a" x1={71} x2={147.55} y1={109} y2={230.946} gradientUnits="userSpaceOnUse">
            <Stop stopColor="#7276F7" />
            <Stop offset={1} stopColor="#7C40E8" />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default EnterEIDPinIcon;
