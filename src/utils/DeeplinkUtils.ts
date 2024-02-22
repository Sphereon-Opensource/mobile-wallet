export const parseDeepLink = (url: string): Record<string, any> => {
  const parts = url.split('?');
  const queryString = parts.length >= 2 ? parts[1] : undefined;
  const params: Record<string, any> = {};

  if (!queryString) {
    return params;
  }

  const kvpairs = queryString.split('&');

  kvpairs.forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  });

  return {params};
};
