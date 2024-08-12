type Error = 'required' | 'invalid';

const defaultErrorMessages: Record<Error, string> = {
  required: 'This field is required',
  invalid: 'Invalid value',
};

type Validator<T> = {
  predicate: (value: T) => boolean;
  errorMessage: string;
};

export const isNonEmptyString = (errorMessage?: string): Validator<string> => ({
  predicate: (value: string): boolean => value.length > 0,
  errorMessage: errorMessage ?? defaultErrorMessages.required,
});

type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export const validate = <T>(value: T, validators: Validator<T>[]): ValidationResult => ({
  isValid: validators.every(validator => validator.predicate(value)),
  errorMessage: validators.find(validator => !validator.predicate(value))?.errorMessage,
});
