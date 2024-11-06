import React from 'react';
import {Text} from 'react-native';
import {URL_VALIDATION_REGEX} from '../@config/constants';

const {v4: uuidv4} = require('uuid');

export const parseTextToElement = (text: string): JSX.Element => {
  const items = text.split(/(<b>.*?<\/b>)/).map(item => {
    if (item.includes('<b>')) {
      const regex = new RegExp('<b>|</b>', 'g');
      return (
        <Text key={uuidv4()} style={{fontWeight: 'bold'}}>
          {item.replace(regex, '')}
        </Text>
      );
    } else {
      return item;
    }
  });

  return <Text>{items}</Text>;
};

export const capitalize = (text: string): string => {
  const lowerCaseText = text.toLowerCase();
  return lowerCaseText.charAt(0).toUpperCase() + lowerCaseText.slice(1);
};

export const checkAndAddHTTPPrefix = (url: string) => {
  if (!url.includes('http')) return 'https://' + url;
  return url;
};

export function parseValidURL(url: string) {
  const invalidProtocols = ['file://', 'ftp://', 'mailto:', 'tel:', 'data:', 'javascript:', 'ws://', 'wss://', 'sms:', 'irc://', 'sftp://', 'blob:'];
  if (invalidProtocols.some(p => url.startsWith(p))) return false;
  try {
    const formattedUrl = url.startsWith('http://') ? url : `http://${url}`;
    const parsedUrl = new URL(formattedUrl);

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
}
