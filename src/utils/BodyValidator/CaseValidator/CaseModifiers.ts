import { TypeofList } from '../shared';

export type CaseModifiersOptions = {
  required: boolean | null;
  typeof: TypeofList | null;
};

export type CaseModifiersError<K extends string | number | symbol> =
  | string
  | ((key: K, value: unknown) => string)
  | null;

export type CaseModifiersErrors<O extends CaseModifiersOptions> = {
  [K in keyof O]: CaseModifiersError<K>;
};

export class CaseModifiers<
  O extends CaseModifiersOptions = CaseModifiersOptions,
> {
  values: O;
  errors: CaseModifiersErrors<O>;

  constructor(options: O) {
    this.values = options;
    // @ts-expect-error - Below of this line we assing null to all properties
    this.errors = {};

    const modifierKeys = Object.keys(options);

    for (const modifierKey of modifierKeys) {
      this.errors[modifierKey] = null;
    }
  }

  clone(): CaseModifiers<O> {
    return new CaseModifiers({
      ...this.values,
    });
  }

  applyOther(modifiers: CaseModifiers): this {
    const modifierKeys = Object.keys(modifiers.values);

    for (const modifierKey of modifierKeys) {
      if (
        modifiers.values[modifierKey] !== null &&
        this.values[modifierKey] === null
      ) {
        this.values[modifierKey] = modifiers.values[modifierKey];
        this.errors[modifierKey] = modifiers.errors[modifierKey];
      }
    }

    return this;
  }

  setValue<K extends keyof O>(key: K, value: O[K]): this {
    this.values[key] = value;

    return this;
  }

  getValue<K extends keyof O>(key: K): O[K] {
    return this.values[key];
  }

  setError<K extends keyof O>(key: K, error: CaseModifiersError<K>): this {
    this.errors[key] = error;

    return this;
  }

  getError<K extends keyof O>(key: K): CaseModifiersError<K> {
    return this.errors[key];
  }

  setModifier<K extends keyof O>(
    key: K,
    value: O[K],
    error?: CaseModifiersError<K>,
  ): this {
    this.setValue(key, value);
    this.setError(key, error ?? null);
    return this;
  }

  setModifierFactory<T, K extends keyof O>(
    _this: T,
    key: K,
    fn?: (value: O[K]) => boolean,
  ): (value: O[K], error?: CaseModifiersError<K>) => T {
    return (value, error) => {
      if (fn && !fn(value)) {
        return _this;
      }

      this.setModifier(key, value, error);
      return _this;
    };
  }
}
