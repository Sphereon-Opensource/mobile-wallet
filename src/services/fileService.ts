import * as RNFS from 'expo-file-system';

import {IReadFileArgs} from '../types';

export const readFile = async ({filePath}: IReadFileArgs): Promise<string> => {
  return RNFS.readAsStringAsync(filePath);
};
