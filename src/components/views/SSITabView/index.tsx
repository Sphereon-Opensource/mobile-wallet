import React, { FC } from 'react'
import { SceneMap, TabView } from 'react-native-tab-view'
import { SceneRendererProps } from 'react-native-tab-view/lib/typescript'

import { ITabRoute, ITabViewRoute } from '../../../@types'
import { SSITabViewContainerStyled as Container } from '../../../styles/components'

import SSITabViewHeader from './SSITabViewHeader'

export interface IProps {
  routes: Array<ITabViewRoute>
}

const SSITabView: FC<IProps> = (props: IProps): JSX.Element => {
  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState(props.routes)

  const sceneMap = props.routes.reduce((a: Record<string, any>, v: ITabViewRoute) => ({ ...a, [v.key]: v.content }), {})
  console.log(`sceneMap: ${JSON.stringify(sceneMap, null, 2)}`)

  return (
    <Container>
      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap(sceneMap)}
        renderTabBar={(
          props: SceneRendererProps & { navigationState: { index: number; routes: Array<ITabRoute> } }
        ) => (
          <SSITabViewHeader
            navigationState={props.navigationState}
            position={props.position}
            onIndexChange={setIndex}
          />
        )}
        onIndexChange={setIndex}
      />
    </Container>
  )
}

export default SSITabView
