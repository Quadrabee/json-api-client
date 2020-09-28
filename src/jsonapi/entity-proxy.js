const NON_PROXIABLE_PROPS = ['id', 'constructor'];

export default class EntityProxy {
  constructor() {
    throw new Error('EntityProxy not meant to be instantiated. Use EntityProxy.create instead');
  }

  static create(entity) {
    return new Proxy(entity, {
      get(o, p) {
        const hasAttribute = o.attributes && o.attributes[p] !== undefined;
        if (NON_PROXIABLE_PROPS.indexOf(p) >= 0) {
          return o[p];
        } else if (hasAttribute) {
          return o.attributes[p];
        } else if (p === 'isProxiedEntity') {
          return true;
        } else if (p === '_proxiedEntity') {
          return o;
        }
        return o[p];
      },
      set(o, p, v) {
        if (p in o) {
          o[p] = v;
        } else if (o.attributes && p in o.attributes) {
          o.attributes[p] = v;
        } else {
          o[p] = v;
        }
        return true;
      },
      deleteProperty(o, p) {
        throw new Error(`Entities are immutable! While trying to delete ${o.constructor.name}.${p}`);
      },
      has(o, p) {
        return o[p] !== undefined || (o.attributes && o.attributes[p] !== undefined);
      }
    });
  }
}
