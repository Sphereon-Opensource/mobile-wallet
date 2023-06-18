import {SortOrder} from '../types';

export function sortBy<T>(key: keyof T, order: SortOrder) {
  return function (a: T, b: T) {
    return orderToNumberSign(order) * (a[key] as string).toLowerCase().localeCompare((b[key] as string).toLowerCase());
  };

  function orderToNumberSign(order: SortOrder) {
    return order === SortOrder.ASC ? 1 : -1;
  }
}
