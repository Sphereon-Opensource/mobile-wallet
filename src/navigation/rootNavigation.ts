import { createNavigationContainerRef } from '@react-navigation/native'

import { NavigationBarRoutesEnum } from '../@types'

export const navigationRef = createNavigationContainerRef()
let targetRouteAfterReady: { name?: never; params?: never } = { name: NavigationBarRoutesEnum.HOME }

export function navigate(name: string, params: Record<string, any>) {
  targetRouteAfterReady = {}
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params)
  } else {
    console.debug(`saving route: ${targetRouteAfterReady}`)
    targetRouteAfterReady = { name, params }
  }
}

export function onReadyCallback() {
  console.debug(`targetRouteAfterReady: ${targetRouteAfterReady}`)
  if (targetRouteAfterReady?.name) {
    console.debug('going to targetRouteAfterReady')
    navigationRef.navigate(targetRouteAfterReady.name, targetRouteAfterReady.params)
  }
}
