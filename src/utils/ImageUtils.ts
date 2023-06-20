import {Image} from 'react-native';
import FastImage from 'react-native-fast-image';

import {IS_IMAGE_URI_REGEX, IS_IMAGE_URL_REGEX} from '../@config/constants';
import {IImageSize, IPreloadImage} from '../types';

export const isImage = async (value: string): Promise<boolean> => {
  return IS_IMAGE_URI_REGEX.test(value) || IS_IMAGE_URL_REGEX.test(value);
};

export const getImageSize = (uri: string): Promise<IImageSize> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width: number, height: number) => resolve({width, height}),
      error => reject(error),
    );
  });
};

export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

export const preloadImage = async (sources: Array<IPreloadImage>): Promise<void> => {
  FastImage.preload(sources);
};
