import { createNavigationContainerRef } from '@react-navigation/native'
import Debug from 'debug'

import {APP_ID} from "../@config/constants";
import { NavigationBarRoutesEnum } from '../@types'

const debug = Debug(`${APP_ID}:rootNavigation`)

export const navigationRef = createNavigationContainerRef()
let targetRouteAfterReady: { name?: never; params?: never } = { name: NavigationBarRoutesEnum.HOME }

export function navigate(name: string, params: Record<string, any>) {
  targetRouteAfterReady = {}
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params)
  } else {
    debug(`saving route: ${targetRouteAfterReady}`)
    targetRouteAfterReady = { name, params }
  }
}

export function onReadyCallback() {
  debug(`targetRouteAfterReady: ${targetRouteAfterReady}`)
  if (targetRouteAfterReady?.name) {
    debug('going to targetRouteAfterReady')
    navigationRef.navigate(targetRouteAfterReady.name, targetRouteAfterReady.params)
  }
}
