import * as RNFS from 'react-native-fs';

import {IReadFileArgs} from '../types';

export const readFile = async ({filePath}: IReadFileArgs): Promise<string> => {
  return RNFS.readFile(filePath);
};
