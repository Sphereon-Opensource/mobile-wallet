import {useState} from "react";
import ShareMenuModule from 'react-native-share-menu';

class SharedDataHandler {

  public static async enableReceivingData(): Promise<void> {
    const [sharedData, setSharedData] = useState(null);
    const [sharedMimeType, setSharedMimeType] = useState(null);

    await ShareMenuModule.getSharedText((data: any) => {
      console.log('2022-12-01' + JSON.stringify(data));

      // let offlinePackageResponse = await RNFS.config({
      //   fileCache: true,
      //   timeout: 9999999,
      //   background: true, // iOS only
      // }).fetch(method, data.data, header)
      // .progress(callback);

      //console.log(`file save at ${offlinePackageResponse.path()}`);

    })
  }

}

export default SharedDataHandler
