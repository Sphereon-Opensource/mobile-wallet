import React, {FC} from 'react';
import {ViewStyle} from "react-native";
import {SceneMap, SceneRendererProps, TabView} from 'react-native-tab-view';

import {SSITabViewContainerStyled as Container} from '../../../styles/components';
import {ITabRoute, ITabViewRoute} from '../../../types';

import SSITabViewHeader from './SSITabViewHeader';

export interface IProps {
  style?: ViewStyle;
  routes: Array<ITabViewRoute>;
}

const SSITabView: FC<IProps> = (props: IProps): JSX.Element => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState(props.routes);
  const style = props.style;
  const sceneMap = props.routes.reduce((a: Record<string, any>, v: ITabViewRoute) => ({...a, [v.key]: v.content}), {});

  return (
    <Container style={{...(style && style)}}>
      <TabView
        navigationState={{index, routes}}
        renderScene={SceneMap(sceneMap)}
        renderTabBar={(props: SceneRendererProps & {navigationState: {index: number; routes: Array<ITabRoute>}}) => (
          <SSITabViewHeader navigationState={props.navigationState} position={props.position} onIndexChange={setIndex} />
        )}
        onIndexChange={setIndex}
      />
    </Container>
  );
};

export default SSITabView;
