export const areElementsSequentialWithDiff =
  (diff: number) =>
  (arr: number[]): boolean =>
    arr.every((char, index, tmp) => index === 0 || char - tmp[index - 1] === diff);

export const areElementsSame = areElementsSequentialWithDiff(0);
export const areElementsIncreasingSequence = areElementsSequentialWithDiff(1);
export const areElementsDecreasingSequence = areElementsSequentialWithDiff(-1);
