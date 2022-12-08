import { createNavigationContainerRef } from '@react-navigation/native'

export const navigationRef = createNavigationContainerRef()
let targetRouteAfterReady: { name?: never; params?: never } = {}

export function navigate(name: string, params: Record<string, any>) {
  targetRouteAfterReady = {}
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params)
  } else {
    targetRouteAfterReady = { name, params }
  }
}

export function onReadyCallback() {
  console.debug(`targetRouteAfterReady: ${targetRouteAfterReady}`)
  if (targetRouteAfterReady?.name && targetRouteAfterReady?.params) {
    console.debug('going to targetRouteAfterReady')
    navigationRef.navigate(targetRouteAfterReady.name, targetRouteAfterReady.params)
  }
}
