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
