import {areElementsSequentialWithDiff} from './array';

export const isNumberASequenceWithDiff = (diff: number) => (number: number) => {
  const arr = Array.from(String(number), Number);
  return areElementsSequentialWithDiff(diff)(arr);
};

export const isIncreasingSequenceNumber = isNumberASequenceWithDiff(1);
export const isDecreasingSequenceNumber = isNumberASequenceWithDiff(-1);
export const isSameDigitNumber = isNumberASequenceWithDiff(0);
