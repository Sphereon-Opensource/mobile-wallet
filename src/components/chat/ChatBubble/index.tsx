import {Ionicons} from '@expo/vector-icons';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {LinearGradient} from 'expo-linear-gradient';
import {StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native';
import {BubbleProps, IMessage, isSameDay, isSameUser, MessageText} from 'react-native-gifted-chat';

export const ChatBubble = (props: BubbleProps<IMessage> & {handleAudioPress?: () => void}) => {
  const {currentMessage, position, nextMessage, containerToNextStyle, previousMessage, containerToPreviousStyle, handleAudioPress} = props;
  const styles = {
    left: StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'flex-start',
        marginBottom: 10,
      },
      wrapper: {
        borderRadius: 0,

        marginRight: 0,
        minHeight: 20,
        justifyContent: 'flex-end',
        padding: 0,
      },
      containerToNext: {
        borderBottomLeftRadius: 3,
      },
      containerToPrevious: {
        borderTopLeftRadius: 3,
      },
      bottom: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
      },
    }),
    right: StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'flex-end',
        marginBottom: 10,
      },
      wrapper: {
        borderRadius: 8,
        borderTopRightRadius: 2,
        marginLeft: 0,
        minHeight: 20,
        justifyContent: 'flex-end',
        backgroundColor: backgroundColors.primaryDark,
      },
      containerToNext: {
        borderBottomRightRadius: 3,
      },
      containerToPrevious: {
        borderTopRightRadius: 3,
      },
      bottom: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
      },
    }),
    content: StyleSheet.create({
      tick: {
        fontSize: 10,

        color: 'pink',
      },
      tickView: {
        flexDirection: 'row',
        marginRight: 10,
      },
      username: {
        top: -3,
        left: 0,
        fontSize: 12,
        color: '#aaa',
      },
      usernameView: {
        flexDirection: 'row',
        marginHorizontal: 10,
      },
    }),
    text: StyleSheet.create({
      left: {
        fontSize: 16,
        lineHeight: 20,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        color: fontColors.dark,
      },
      right: {
        fontSize: 16,
        lineHeight: 20,
        marginTop: 8,
        marginBottom: 8,
        marginLeft: 4,
        marginRight: 4,
        color: fontColors.light,
      },
    }),
  };

  function styledBubbleToNext() {
    if (currentMessage && nextMessage && position && isSameUser(currentMessage, nextMessage) && isSameDay(currentMessage, nextMessage))
      return [styles[position].containerToNext, containerToNextStyle?.[position]];

    return null;
  }

  function styledBubbleToPrevious() {
    if (currentMessage && previousMessage && position && isSameUser(currentMessage, previousMessage) && isSameDay(currentMessage, previousMessage))
      return [styles[position].containerToPrevious, containerToPreviousStyle && containerToPreviousStyle[position]];

    return null;
  }

  const Gradient = (props: ViewProps) => <LinearGradient colors={['#7276F7', '#7C40E8']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} {...props} />;

  const WrapperComponent = position === 'left' ? View : Gradient;

  return (
    <View style={[styles[position].container]}>
      <WrapperComponent style={[styles[position].wrapper, styledBubbleToNext(), styledBubbleToPrevious()]}>
        <MessageText {...props} textStyle={styles.text} />
        {position === 'left' && (
          <TouchableOpacity onPress={() => handleAudioPress && handleAudioPress()}>
            <Ionicons name="volume-high-outline" size={28} color={fontColors.dark} />
          </TouchableOpacity>
        )}
      </WrapperComponent>
    </View>
  );
};
