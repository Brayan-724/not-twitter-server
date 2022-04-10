export interface ValidatorErrorOptions {
  path: string[];
  message: string;
}

export class ValidatorError {
  constructor(protected readonly options: ValidatorErrorOptions) {}

  public toString(): string {
    return `${this.options.path.join('.')}: ${this.options.message}`;
  }

  getDetails(): ValidatorErrorOptions {
    return this.options;
  }
}
