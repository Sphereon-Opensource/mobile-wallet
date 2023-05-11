export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export function sortBy<T>(key: keyof T, order: SortOrder) {
  return function (a: T, b: T) {
    return orderToNumberSign(order) * (a[key] as String).toLowerCase().localeCompare((b[key] as String).toLowerCase()) ;
  };

  function orderToNumberSign(order: SortOrder) {
    return order === SortOrder.ASC ? 1 : -1
  }
}
