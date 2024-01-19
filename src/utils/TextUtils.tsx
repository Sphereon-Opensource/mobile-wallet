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

export const base64UrlEncode = (input: Uint8Array): string => {
  const base64 = Buffer.from(input).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const base64UrlEncodeString = (input: string): string => {
  const base64 = btoa(input);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
