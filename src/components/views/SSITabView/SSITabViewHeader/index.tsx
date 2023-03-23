import React, {FC} from 'react';
import {Animated} from 'react-native';

import {
  SSITabViewHeaderContainerStyled as Container,
  SSITabViewHeaderTabHeaderStyled as Header,
  SSITabViewHeaderTabHeaderCaptionStyled as HeaderCaption,
  SSITabViewHeaderTabIndicatorStyled as HeaderIndicator,
} from '../../../../styles/components';
import {ITabRoute} from '../../../../types';

const {v4: uuidv4} = require('uuid');

export interface IProps {
  navigationState: {index: number; routes: Array<ITabRoute>};
  position: Animated.AnimatedInterpolation<number>;
  onIndexChange: (index: number) => void;
}

const SSITabViewHeader: FC<IProps> = (props: IProps): JSX.Element => {
  const {navigationState, position, onIndexChange} = props;

  const inputRange = navigationState.routes.map((route: ITabRoute, index: number) => index);
  const numberOfTabs = inputRange.length;
  /*
    TODO figure out this opacity interpolate down below. it needs 2 or more values for some reason. Currently they are based on the tab indexes, which I do not think is right.
    When there is only 1 tab, a "second" index is added to make it also work with 1 tab
  */
  const opacityInterpolate = inputRange;
  if (numberOfTabs === 1) opacityInterpolate.push(1);

  return (
    <Container>
      {navigationState.routes.map((route: ITabRoute, i: number) => {
        const opacity = position.interpolate({
          inputRange,
          outputRange: opacityInterpolate.map((index: number) => (index === i ? 1 : 0.5)),
        });
        return (
          <Header
            style={{
              marginLeft: numberOfTabs === 1 ? 24 : undefined,
              alignItems: numberOfTabs > 1 ? 'center' : undefined,
            }}
            key={uuidv4()}
            onPress={() => onIndexChange(i)}>
            <HeaderCaption style={{opacity, marginBottom: 2}}>{route.title}</HeaderCaption>
            {numberOfTabs > 1 && navigationState.index === i ? <HeaderIndicator /> : null}
          </Header>
        );
      })}
    </Container>
  );
};

export default SSITabViewHeader;
