type Validator<T> = (data: unknown) => data is T;

export const parseAndValidateJson = <T>(jsonString: string, validator: Validator<T>): T | null => {
  try {
    const parsed = JSON.parse(jsonString);
    return validator(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
