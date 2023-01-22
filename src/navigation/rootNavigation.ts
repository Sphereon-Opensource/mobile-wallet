import { createNavigationContainerRef, PartialState } from '@react-navigation/native'
import { NavigationAction, StackActions } from 'react-navigation'

import { StackParamList } from '../@types'

export const navigationRef = createNavigationContainerRef<StackParamList>()

export function navigate(name: string, params: Record<string, any>): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params)
  }
}

export function goBack(): void {
  if (navigationRef.isReady()) {
    navigationRef.goBack()
  }
}

export function getId(): string | undefined {
  if (navigationRef.isReady()) {
    return navigationRef.getId()
  }

  return undefined
}

export function reset(state: PartialState<any> | any): void {
  if (navigationRef.isReady()) {
    navigationRef.reset(state)
  }
}

export function isFocused(): boolean {
  if (navigationRef.isReady()) {
    return navigationRef.isFocused()
  }

  return false
}

export function canGoBack(): boolean {
  if (navigationRef.isReady()) {
    return navigationRef.canGoBack()
  }

  return false
}

export function dispatch(action: NavigationAction | ((state: any) => NavigationAction)): void {
  if (navigationRef.isReady()) {
    navigationRef.goBack()
  }
}


export function push(...args: any[]): void {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(...args))
  }
}

export function getState(): any {
  if (navigationRef.isReady()) {
    return navigationRef.getState()
  }

  return undefined
}
