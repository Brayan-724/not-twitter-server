import { ObjectPath } from 'src/utils/ObjectPath';
import { ValidatorError } from '../ValidatorError';
import { CaseModifiers, CaseModifiersOptions } from './CaseModifiers';
import { CaseValidation } from './CaseValidation';

export interface CaseValidator {
  validate<T>(value: T, path: string[]): CaseValidation;
}

export class CaseValidator<M = Record<string, unknown>> {
  protected objectPath: ObjectPath = new ObjectPath();
  protected modifiers: CaseModifiers<M & CaseModifiersOptions>;

  constructor(modifiers: M) {
    if (this.constructor === CaseValidator) {
      throw new TypeError(
        'CaseValidator is an abstract class and cannot be instantiated directly',
      );
    }

    this.modifiers = new CaseModifiers(
      Object.assign<CaseModifiersOptions, M>(
        {
          required: null,
          typeof: null,
        },
        modifiers,
      ),
    );
  }

  isRequired(): this {
    this.modifiers.values.required = true;
    return this;
  }

  applyOther(validator: CaseValidator): this {
    const modifiers = validator.getModifiers();

    this.modifiers.applyOther(modifiers);

    return this;
  }

  getModifiers(): CaseModifiers<M & CaseModifiersOptions> {
    return this.modifiers;
  }

  protected createValidationError<K extends keyof (M & CaseModifiersOptions)>(
    key: K,
    _default: string,
    path: string[],
    value: unknown,
    canEntrance = true,
  ): CaseValidation {
    const error = this.getError(key, _default, value);

    return new CaseValidation({
      valid: false,
      canEntrance,
      error: new ValidatorError({
        path,
        message: error,
      }),
    });
  }

  protected getError<K extends keyof (M & CaseModifiersOptions)>(
    key: K,
    _default: string,
    value: unknown,
  ): string {
    const error = this.modifiers.errors[key];

    if (error !== null) {
      if (typeof error === 'string') {
        return error;
      }

      return error(key, value);
    }

    return _default;
  }
}
