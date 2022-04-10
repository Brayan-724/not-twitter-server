import { ValidatorError } from '../ValidatorError';

export interface CaseValidationOptions {
  valid: boolean;
  canEntrance: boolean;
  error?: ValidatorError;
  value?: unknown;
}

export class CaseValidation {
  readonly valid = this.options.valid;
  readonly canEntrance = this.options.canEntrance;
  readonly error = this.options.error;
  readonly value = this.options.value;

  constructor(protected readonly options: CaseValidationOptions) {}
}
