import { ObjectPath } from '../ObjectPath';
import { CaseValidator } from './CaseValidator';
import { GlobalValidator } from './CaseValidator/GlobalValidator';
import { ValidatorError } from './ValidatorError';

export class PartValidator {
  private objectPath: ObjectPath = new ObjectPath();

  protected path: string[];

  protected _globalCaseValidator: GlobalValidator = new GlobalValidator();
  protected _cases: CaseValidator[] = [];

  constructor(path: string) {
    this.path = this.objectPath.parse(path);
  }

  isRequired(): this {
    this._globalCaseValidator.isRequired();
    return this;
  }

  case(validator: CaseValidator): this {
    validator.applyOther(this._globalCaseValidator);
    this._cases.push(validator);
    return this;
  }

  globalCase(validator: GlobalValidator): this {
    this._globalCaseValidator = validator;
    return this;
  }

  validate<T>(value: T): [true, unknown] | [false, ValidatorError] {
    // First handle global case
    const globalCaseResult = this._globalCaseValidator.validate(
      value,
      this.path,
    );
    const defaultValue = this._globalCaseValidator.getDefault();

    if (globalCaseResult.valid === false) {
      // If global case is not valid, but there's a default value and is not required, return it
      if (
        defaultValue !== undefined &&
        !this._globalCaseValidator.getModifiers().values.required
      ) {
        return [true, defaultValue];
      }

      // else, return the error
      return [false, globalCaseResult.error];
    }

    let firstCaseError: null | ValidatorError = null;
    const isRequiredArray: boolean[] = [
      this._globalCaseValidator.getModifiers().values.required || false,
    ];

    // If global case is valid, check the other cases
    for (const caseValidator of this._cases) {
      const caseResult = caseValidator.validate(value, this.path);

      isRequiredArray.push(caseValidator.getModifiers().values.required);

      // If case is valid, return the result
      if (caseResult.valid === true) {
        return [true, caseResult.value];
      }

      if (caseResult.canEntrance) {
        firstCaseError = caseResult.error;
      }
    }

    // If no case is valid, return the error
    if (firstCaseError) {
      return [false, firstCaseError];
    }

    // If no case is valid, but there's a default value and is not required, return it
    if (
      defaultValue !== undefined &&
      !isRequiredArray[0] &&
      isRequiredArray.some((isRequired) => !isRequired)
    ) {
      return [true, defaultValue];
    }

    return [
      false,
      new ValidatorError({
        path: this.path,
        message: "Invalid value (There's no valid case).",
      }),
    ];
  }

  getCases(): CaseValidator[] {
    return this._cases;
  }

  getGlobalCase(): GlobalValidator | undefined {
    return this._globalCaseValidator;
  }

  getPath(): string[] {
    return this.path;
  }
}
