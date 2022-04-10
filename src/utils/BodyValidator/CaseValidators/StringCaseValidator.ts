import { CaseValidator } from '../CaseValidator';
import { ValidatorError } from '../ValidatorError';
import { CaseValidation } from '../CaseValidator/CaseValidation';

type StringModifiersOptions = {
  min: number | null;
  max: number | null;
  lower: boolean | null;
  upper: boolean | null;
  regex: RegExp | null;
};

export class StringCaseValidator
  extends CaseValidator<StringModifiersOptions>
  implements CaseValidator
{
  constructor() {
    super({
      min: null,
      max: null,
      lower: null,
      upper: null,
      regex: null,
    });

    this.modifiers.values.typeof = 'string';
  }

  //#region - Conditional modifiers
  regex = this.modifiers.setModifierFactory(this, 'regex');
  minLength = this.modifiers.setModifierFactory(this, 'min');
  maxLength = this.modifiers.setModifierFactory(this, 'max');

  isUpperCase = this.modifiers.setModifierFactory(this, 'upper', () => {
    if (this.modifiers.getValue('lower') === true) {
      throw new Error('Cannot set both lower and upper');
    }

    return true;
  });

  isLowerCase = this.modifiers.setModifierFactory(this, 'lower', () => {
    if (this.modifiers.getValue('lower') === true) {
      throw new Error('Cannot set both lower and upper');
    }

    return true;
  });
  //#endregion

  validate<T>(value: T, path: string[]): CaseValidation {
    if (typeof value !== 'string') {
      return new CaseValidation({
        valid: false,
        canEntrance: false,
        error: new ValidatorError({
          path,
          message: `Expected string, got ${typeof value}`,
        }),
      });
    }

    const { min, max, upper, lower, regex } = this.modifiers.values;

    if (min !== null && value.length < min) {
      return this.createValidationError(
        'min',
        `Expected string length to be at least ${min}, got ${value.length}`,
        path,
        value,
      );
    }

    if (max !== null && value.length > max) {
      return this.createValidationError(
        'max',
        `Expected string length to be at most ${max}, got ${value.length}`,
        path,
        value,
      );
    }

    if (upper !== null && value.toUpperCase() !== value) {
      return this.createValidationError(
        'upper',
        `Expected string to be upper case, got ${value}`,
        path,
        value,
      );
    }

    if (lower !== null && value.toLowerCase() !== value) {
      return this.createValidationError(
        'lower',
        `Expected string to be lower case, got ${value}`,
        path,
        value,
      );
    }

    if (regex !== null && !regex.test(value)) {
      return this.createValidationError(
        'regex',
        `Expected string to match ${regex}, got ${value}`,
        path,
        value,
      );
    }

    return new CaseValidation({
      valid: true,
      canEntrance: true,
      value,
    });
  }
}
