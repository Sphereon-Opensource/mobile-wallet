import { Linking } from 'react-native'

import * as RootNavigation from '../../navigation/rootNavigation'
import { readQr } from '../../services/qrService'

class DeepLinkProvider {
  public static enableDeepLinking = async (): Promise<void> => {
    await this.addListener()
    Linking.getInitialURL().then((url: string | null) => {
      // Added expo-development-client check because of how the expo works in development
      if (url === null || url.includes('expo-development-client')) {
        return
      }

      this.deepLinkListener({ url })
    })
  }

  public static addListener = async (): Promise<void> => {
    Linking.addEventListener('url', this.deepLinkListener)
  }

  private static deepLinkListener = async (event: { url: string }): Promise<void> => {
    // TODO this DeepLinkingProvider is now hard-coupled to assume the links are QR flows
    // TODO fix this type issue
    await readQr({ qrData: event.url, navigation: RootNavigation })
  }
}

export default DeepLinkProvider
