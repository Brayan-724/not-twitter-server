import { CaseValidator } from '../CaseValidator';
import { ValidatorError } from '../ValidatorError';
import { CaseValidation } from '../CaseValidator/CaseValidation';

type NumberModifiersOptions = {
  min: number | null;
  max: number | null;
};

export class NumberCaseValidator
  extends CaseValidator<NumberModifiersOptions>
  implements CaseValidator
{
  constructor() {
    super({
      min: null,
      max: null,
    });

    this.modifiers.values.typeof = 'number';
  }

  min = this.modifiers.setModifierFactory(this, 'min');
  max = this.modifiers.setModifierFactory(this, 'max');

  validate<T>(value: T, path: string[]): CaseValidation {
    if (typeof value !== 'number') {
      return new CaseValidation({
        valid: false,
        canEntrance: false,
        error: new ValidatorError({
          path,
          message: `Expected number, got ${typeof value}`,
        }),
      });
    }

    const { min, max } = this.modifiers.values;

    if (min !== null && value < min) {
      return this.createValidationError(
        'min',
        `Expected number to be greater than or equal to ${min}`,
        path,
        value,
      );
    }

    if (max !== null && value > max) {
      return this.createValidationError(
        'max',
        `Expected number to be less than or equal to ${max}`,
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
