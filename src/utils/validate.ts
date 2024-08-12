import {EMAIL_ADDRESS_VALIDATION_REGEX} from '../@config/constants';

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

export const IsValidEmail = (errorMessage?: string): Validator<string> => ({
  predicate: (value: string): boolean => EMAIL_ADDRESS_VALIDATION_REGEX.test(value),
  errorMessage: errorMessage ?? defaultErrorMessages.invalid,
});

type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export const validate = <T>(value: T, validators: Validator<T>[]): ValidationResult => ({
  isValid: validators.every(validator => validator.predicate(value)),
  errorMessage: validators.find(validator => !validator.predicate(value))?.errorMessage,
});
