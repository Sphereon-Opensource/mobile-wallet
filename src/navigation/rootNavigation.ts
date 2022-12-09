import { createNavigationContainerRef } from '@react-navigation/native'

export const navigationRef = createNavigationContainerRef()

export function navigate(name: string, params: Record<string, any>) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params)
  }
}
