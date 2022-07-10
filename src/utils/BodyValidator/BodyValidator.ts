import { Request } from 'express';
import { Memoizer } from '../memoizer/Memoizer';
import { ObjectPath } from '../ObjectPath';
import { PartValidator } from './PartValidator';
import { ValidatorError } from './ValidatorError';

export type ValidateReturn = [true, unknown] | [false, ValidatorError];

export class BodyValidator {
  protected objectPath = new ObjectPath();
  protected parts: PartValidator[] = [];
  private memoizer = new Memoizer<ValidateReturn>();

  getPart(part: PartValidator): this {
    this.parts.push(part);
    return this;
  }

  validate(req: Request): ValidateReturn {
    if (typeof req.body !== 'object') {
      return [
        false,
        new ValidatorError({
          path: [],
          message: 'Body is not an object',
        }),
      ];
    }

    const body = { ...req.body };

    if (this.memoizer.has([body])) {
      return this.memoizer.get([body]);
    }

    for (const part of this.parts) {
      const partPath = part.getPath();
      const value = this.objectPath.get(body, partPath);
      const result = part.validate(value);

      if (result[0] === false) {
        return result;
      }

      this.objectPath.set(body, partPath, result[1]);
    }

    const returnValue: ValidateReturn = [true, body];

    this.memoizer.set([returnValue], returnValue);

    return returnValue;
  }
}
