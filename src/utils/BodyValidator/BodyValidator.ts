import { Request } from 'express';
import { ObjectPath } from '../ObjectPath';
import { PartValidator } from './PartValidator';
import { ValidatorError } from './ValidatorError';

export class BodyValidator {
  protected objectPath = new ObjectPath();
  protected parts: PartValidator[] = [];

  getPart(part: PartValidator): this {
    this.parts.push(part);
    return this;
  }

  validate(req: Request): [true, unknown] | [false, ValidatorError] {
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

    for (const part of this.parts) {
      const partPath = part.getPath();
      const value = this.objectPath.get(body, partPath);
      const result = part.validate(value);

      if (result[0] === false) {
        return result;
      }

      this.objectPath.set(body, partPath, result[1]);
    }

    return [true, body];
  }
}
