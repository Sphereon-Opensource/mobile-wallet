import {EMAIL_ADDRESS_VALIDATION_REGEX} from '../@config/constants';
import {isDecreasingSequenceNumber, isIncreasingSequenceNumber, isSameDigitNumber} from './number';

export enum ValidatorType {
  isNonEmptyString = 'isNonEmptyString',
  isValidEmail = 'isValidEmail',
  isNotNil = 'isNotNil',
  isNotSameDigits = 'isNotSameDigits',
  isNotSequentialDigits = 'isNotSequentialDigits',
  isStringOfLength = 'isStringOfLength',
}

export type Validator<T> = {
  key: ValidatorType;
  predicate: (value: T) => boolean;
  errorMessage: string;
};

export type ValidationError<T> = {
  message: string;
  validator: ValidatorType;
  errorValue: T;
};

export type ValidationResult<T> = {
  isValid: boolean;
  error?: ValidationError<T>;
};

const defaultErrorMessages: Record<ValidatorType, string> = {
  isNonEmptyString: 'This field is required',
  isValidEmail: 'Invalid email value',
  isNotNil: 'This field is required',
  isNotSameDigits: 'All digits cannot be the same',
  isNotSequentialDigits: 'Digits cannot be sequential',
  isStringOfLength: 'Invalid length',
};

export const isNotNil = <T>(errorMessage?: string): Validator<T> => ({
  key: ValidatorType.isNotNil,
  predicate: value => value !== undefined && value !== null,
  errorMessage: errorMessage ?? defaultErrorMessages[ValidatorType.isNotNil],
});

export const isNonEmptyString = (errorMessage?: string): Validator<string> => ({
  key: ValidatorType.isNonEmptyString,
  predicate: str => str.length > 0,
  errorMessage: errorMessage ?? defaultErrorMessages[ValidatorType.isNonEmptyString],
});

export const IsValidEmail = (errorMessage?: string): Validator<string> => ({
  key: ValidatorType.isValidEmail,
  predicate: str => EMAIL_ADDRESS_VALIDATION_REGEX.test(str),
  errorMessage: errorMessage ?? defaultErrorMessages[ValidatorType.isValidEmail],
});

export const isNotSameDigits = (errorMessage?: string): Validator<number> => ({
  key: ValidatorType.isNotSameDigits,
  predicate: n => !isSameDigitNumber(n),
  errorMessage: errorMessage ?? defaultErrorMessages[ValidatorType.isNotSameDigits],
});

export const isNotSequentialDigits = (errorMessage?: string): Validator<number> => ({
  key: ValidatorType.isNotSequentialDigits,
  predicate: n => !isIncreasingSequenceNumber(n) && !isDecreasingSequenceNumber(n),
  errorMessage: errorMessage ?? defaultErrorMessages[ValidatorType.isNotSequentialDigits],
});

export const isStringOfLength =
  (length: number) =>
  (errorMessage?: string): Validator<string> => ({
    key: ValidatorType.isStringOfLength,
    predicate: s => s.length === length,
    errorMessage: errorMessage ?? defaultErrorMessages[ValidatorType.isStringOfLength],
  });

export const validate = <T>(value: T, validators: Validator<T>[]): ValidationResult<T> => {
  const invalid = validators.find(validator => !validator.predicate(value));
  return {
    isValid: validators.every(validator => validator.predicate(value)),
    error: invalid
      ? {
          message: invalid.errorMessage,
          validator: invalid.key,
          errorValue: value,
        }
      : undefined,
  };
};
