import {SortOrder} from '../types';

export function sortBy<T>(key: string, order: SortOrder) {
  return function (a: T, b: T) {
    const keys: Array<string> = key.split('.');
    let aValue: any = a;
    let bValue: any = b;

    for (const key of keys) {
      aValue = aValue[key];
      bValue = bValue[key];
    }

    return orderToNumber(order) * String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
  };

  function orderToNumber(order: SortOrder): number {
    return order === SortOrder.ASC ? 1 : -1;
  }
}
