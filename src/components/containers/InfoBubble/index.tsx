import {fontColors} from '@sphereon/ui-components.core';
import {Text, View} from 'react-native';

type Props = {
  message: string;
};

const InfoBubble = ({message}: Props) => {
  return (
    <View
      accessible
      accessibilityRole="text"
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        gap: 8,
      }}>
      <Text style={{fontSize: 16, lineHeight: 20, color: fontColors.light, opacity: 0.8}}>&#x24D8;</Text>
      <Text style={{flex: 1, fontSize: 13, lineHeight: 18, color: fontColors.light, opacity: 0.8}}>{message}</Text>
    </View>
  );
};

export default InfoBubble;
