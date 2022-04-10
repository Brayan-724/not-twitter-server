export type ImpurePath = string | (string | string[])[];

export class ObjectPath {
  parse(path: string): string[] {
    return path.split('.');
  }

  normalize(path: ImpurePath): string[] {
    if (typeof path === 'string') {
      return this.parse(path);
    }

    return path.flatMap((p) => {
      if (typeof p === 'string') {
        return this.parse(p);
      }

      return p;
    });
  }

  get(object: any, path: ImpurePath): any {
    const parts = this.normalize(path);

    return parts.reduce((acc, part) => {
      if (acc === undefined) {
        return undefined;
      }

      return acc[part];
    }, object);
  }

  set(object: any, path: ImpurePath, value: any) {
    const parts = this.normalize(path);

    const lastPart = parts.pop();

    if (lastPart === undefined) {
      return;
    }

    const parent = this.get(object, parts);

    if (parent === undefined) {
      return;
    }

    parent[lastPart] = value;
  }

  stringify(path: ImpurePath): string {
    return this.normalize(path).join('.');
  }
}
