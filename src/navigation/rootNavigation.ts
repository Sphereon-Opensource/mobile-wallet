import { createNavigationContainerRef } from '@react-navigation/native'

import { StackParamList } from '../@types'

export const navigationRef = createNavigationContainerRef<StackParamList>()

export function navigate(name: string, params: Record<string, any>) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params)
  }
}
