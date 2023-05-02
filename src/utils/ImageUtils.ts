import {Image} from 'react-native';
import {IS_IMAGE_URI_REGEX} from '../@config/constants';
import {IImageSize} from '../types';

export const isImage = async (value: string): Promise<boolean> => {
  if (IS_IMAGE_URI_REGEX.test(value)) {
    return true;
  } else {
    return Image.prefetch(value)
      .then(() => true)
      .catch(() => false);
  }
};

export const scaleImageToMaxWidth = (width: number, height: number, maxWidth: number): IImageSize => {
  const scaleFactor = maxWidth / width;
  const scaledWidth = Math.round(width * scaleFactor);
  const scaledHeight = Math.round(height * scaleFactor);
  return {
    width: scaledWidth,
    height: scaledHeight,
  };
};

export const scaleImageToMaxHeight = (width: number, height: number, maxHeight: number): IImageSize => {
  const scaleFactor = maxHeight / height;
  const scaledWidth = Math.round(width * scaleFactor);
  const scaledHeight = Math.round(height * scaleFactor);
  return {
    width: scaledWidth,
    height: scaledHeight,
  };
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
