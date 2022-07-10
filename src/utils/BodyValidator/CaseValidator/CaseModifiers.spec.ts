import { CaseModifiersOptions } from '.';
import { CaseModifiers } from './CaseModifiers';

type TestCaseModifiersOptions = {
  foo: string | null;
  baz: string | null;
} & CaseModifiersOptions;

describe('CaseModifiers', () => {
  it('.setValue', () => {
    const modifiers = new CaseModifiers<TestCaseModifiersOptions>({
      required: true,
      typeof: 'string',
      foo: null,
      baz: null,
    });

    modifiers.setValue('foo', 'bar');

    expect(modifiers.getValue('foo')).toBe('bar');
    expect(modifiers.getValue('baz')).toBeNull();
  });

  it('.setError', () => {
    const modifiers = new CaseModifiers<TestCaseModifiersOptions>({
      required: true,
      typeof: 'string',
      foo: null,
      baz: null,
    });

    modifiers.setError('foo', 'bar');

    expect(modifiers.getError('foo')).toBe('bar');
    expect(modifiers.getError('baz')).toBeNull();
  });

  it('.clone', () => {
    const modifiers = new CaseModifiers<TestCaseModifiersOptions>({
      required: true,
      typeof: 'string',
      foo: null,
      baz: null,
    });

    const clonedModifiers = modifiers.clone();

    expect(clonedModifiers.getValue('foo')).toBeNull();
    expect(clonedModifiers.getValue('baz')).toBeNull();

    modifiers.setValue('foo', 'bar');

    expect(modifiers.getValue('foo')).toBe('bar');
    expect(clonedModifiers.getValue('foo')).toBeNull();
  });

  it('.applyOther', () => {
    const modifiers = new CaseModifiers<TestCaseModifiersOptions>({
      required: true,
      typeof: 'string',
      foo: null,
      baz: 'pop',
    });

    const otherModifiers = new CaseModifiers<TestCaseModifiersOptions>({
      required: false,
      typeof: 'number',
      foo: 'bar',
      baz: null,
    });

    otherModifiers.applyOther(modifiers);

    expect(modifiers.getValue('required')).toBe(true);
    expect(modifiers.getValue('foo')).toBeNull();
    expect(modifiers.getValue('baz')).toBe('pop');

    expect(otherModifiers.getValue('required')).toBe(false);
    expect(otherModifiers.getValue('foo')).toBe('bar');
    expect(otherModifiers.getValue('baz')).toBe('pop');

    modifiers.setValue('foo', 'bar2');

    expect(modifiers.getValue('foo')).toBe('bar2');
    expect(otherModifiers.getValue('foo')).toBe('bar');

    otherModifiers.setValue('foo', 'bar3');

    expect(modifiers.getValue('foo')).toBe('bar2');
    expect(otherModifiers.getValue('foo')).toBe('bar3');
  });

  it('.setModifier', () => {
    const modifiers = new CaseModifiers<TestCaseModifiersOptions>({
      required: true,
      typeof: 'string',
      foo: null,
      baz: null,
    });

    modifiers.setModifier('foo', 'bar');

    expect(modifiers.getValue('foo')).toBe('bar');
    expect(modifiers.getError('foo')).toBeNull();
    expect(modifiers.getValue('baz')).toBeNull();

    modifiers.setModifier('foo', 'bar2', 'Error message');

    expect(modifiers.getValue('foo')).toBe('bar2');
    expect(modifiers.getError('foo')).toBe('Error message');
    expect(modifiers.getValue('baz')).toBeNull();
    expect(modifiers.getError('baz')).toBeNull();
  });

  it('');
});
