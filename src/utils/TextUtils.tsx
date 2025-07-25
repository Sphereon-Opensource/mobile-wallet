import React from 'react';
import {Text} from 'react-native';

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

export function parseValidURL(url: string): boolean {
  if (!url || !url.includes('.') || !/^https?:\/\//.test(url)) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.length > 0;
  } catch {
    return false;
  }
}
