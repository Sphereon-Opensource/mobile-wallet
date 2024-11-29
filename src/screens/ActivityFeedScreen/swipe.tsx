import React, { Component } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';


const onSwipe = (direction: any) => { // TODO any
  console.log(`swiped left, good job! direction: ${direction}`)
  // if (event.nativeEvent.state. === "left") {
  //   console.log(`swiped left, good job! index: ${index}`)
  // }
};

class AppleStyleSwipeableRow extends Component {
  // @ts-ignore
  renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    return (
      <RectButton >
        <Animated.Text
          style={[
            {
              transform: [{ translateX: trans }],
            },
          ]}>
          Archive
        </Animated.Text>
      </RectButton>
    );
  };


  //this.renderRightActions

  render() {
    return (
      <Swipeable renderRightActions={() => <View style={{width: 50, height: 50}}/>} onSwipeableOpen={(direction) => onSwipe(direction)}>
        <View style={{width: 300, height: 50, backgroundColor: 'red'}}><Text>"hello"</Text></View>
      </Swipeable>
    );
  }
}

export default AppleStyleSwipeableRow
