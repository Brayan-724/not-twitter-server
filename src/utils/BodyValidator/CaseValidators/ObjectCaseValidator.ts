import { CaseValidator } from '../CaseValidator';
import { PartValidator } from '../PartValidator';
import { ValidatorError } from '../ValidatorError';
import { CaseModifiersOptions } from '../CaseValidator/CaseModifiers';
import { CaseValidation } from '../CaseValidator/CaseValidation';

export type ObjectModifierOptions = CaseModifiersOptions;

export class ObjectCaseValidator
  extends CaseValidator<ObjectModifierOptions>
  implements CaseValidator
{
  protected parts: PartValidator[] = [];
  protected anyPart: PartValidator | null = null;

  constructor() {
    super({
      typeof: 'object',
      required: false,
    });

    this.modifiers.values.typeof = 'object';
  }

  getPart(part: PartValidator): this {
    const path = part.getPath();

    if (path[0] === '*') {
      if (this.anyPart) {
        throw new Error("Can't add more than one any part");
      }

      this.anyPart = part;
      return this;
    }

    this.parts.push(part);
    return this;
  }

  validate<T>(value: T, path: string[]): CaseValidation {
    if (typeof value !== 'object') {
      return new CaseValidation({
        valid: false,
        canEntrance: false,
        error: new ValidatorError({
          path,
          message: `Expected object, got ${typeof value}`,
        }),
      });
    }

    const newValue = { ...value };
    const keysHandled = new Set<string>();

    for (const part of this.parts) {
      const partValue = this.objectPath.get(newValue, part.getPath());
      const validation = part.validate(partValue);

      keysHandled.add(part.getPath()[0]);

      if (validation[0]) {
        this.objectPath.set(newValue, part.getPath(), validation[1]);
      }

      if (validation[0] === false) {
        return new CaseValidation({
          valid: false,
          canEntrance: true,
          error: validation[1],
        });
      }
    }

    if (this.anyPart) {
      const allKeys = Object.keys(newValue);
      const anyKeys = allKeys.filter((key) => !keysHandled.has(key));

      for (const key of anyKeys) {
        const partValue = newValue[key];
        const validation = this.anyPart.validate(partValue);

        if (validation[0]) {
          this.objectPath.set(newValue, this.anyPart.getPath(), validation[1]);
        }

        if (validation[0] === false) {
          return new CaseValidation({
            valid: false,
            canEntrance: true,
            error: validation[1],
          });
        }
      }
    }

    return new CaseValidation({
      valid: true,
      canEntrance: false,
      value: newValue,
    });
  }
}
