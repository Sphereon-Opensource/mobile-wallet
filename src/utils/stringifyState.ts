export const stringifyState = (state: {}): string => {
  let newState = {...state};
  const clean = (obj: any) => {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        newObj[key] = obj[key].map((item: any) => {
          if (typeof item === 'object') {
            return clean(item);
          }
          return item;
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        newObj[key] = clean(obj[key]);
      } else if (typeof obj[key] === 'string') {
        if (!obj[key].startsWith('data:') && obj[key].length < 100) {
          // only include strings that are less than 100 characters and do not start with 'data:'
          newObj[key] = obj[key];
        }
      }
    }
    return newObj;
  };

  const cleanState = clean(newState);
  return JSON.stringify(cleanState);
};
