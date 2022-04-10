import { CaseValidator } from '.';
import { ValidatorError } from '../ValidatorError';
import { CaseValidation } from './CaseValidation';

export class GlobalValidator extends CaseValidator<Record<string, never>> {
  protected _default: unknown;
  constructor() {
    super({});
  }

  default<T>(value: T): this {
    this._default = value;
    return this;
  }

  getDefault(): unknown {
    return this._default;
  }

  validate<T>(value: T, path: string[]): CaseValidation {
    const isRequired = this.getModifiers().values.required;

    if (isRequired && value === undefined) {
      return new CaseValidation({
        valid: false,
        canEntrance: false,
        error: new ValidatorError({
          path,
          message: 'Is required',
        }),
      });
    }

    return new CaseValidation({
      valid: true,
      canEntrance: true,
      value,
    });
  }
}
