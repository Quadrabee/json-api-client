export default class TranslationGroup {
  #client;
  #namespace;
  #defaults;
  #values;

  constructor({ client, namespace, defaults } = { defaults: {} }) {
    this.#client = client;
    this.#namespace = namespace;
    this.#defaults = defaults;
    this.setTranslations(defaults);
  }

  get namespace() {
    return this.#namespace;
  }

  get defaults() {
    return Object.assign({}, this.#defaults);
  }

  get root() {
    return this.#client.I18NService.groups;
  }

  setTranslations(values) {
    this._resetDefaults();

    const addTrans = (values, obj) => {
      const keys = Object.keys(values);
      return keys.reduce((o, k) => {
        const value = values[k];
        if (value instanceof Object) {
          o[k] = addTrans(value, o[k] || {});
        } else {
          o[k] = value;
        }
        return o;
      }, obj);
    };
    const trs = addTrans(values, this);
    this._decorate(trs, this);
  }

  _resetDefaults() {
    const dup = (obj, dest) => {
      return Object.keys(obj).reduce((o, k) => {
        const v = obj[k];
        if (v instanceof Object) {
          o[k] = dup(v);
        } else {
          o[k] = v;
        }
        return o;
      }, dest || {});
    };
    return dup(this.#defaults, this);
  }

  _decorate(translations, dest = this) {
    const keys = Object.keys(translations);
    return keys.reduce((o, k) => {
      const v = translations[k];
      if (v instanceof Object) {
        o[k] = this._decorate(v, {});
      } else if (v.match(/\{\w+\}/)) {
        o[k] = this._instantiator(v);
      } else {
        o[k] = v;
      }
      return o;
    }, dest);
  }

  _instantiator(str) {
    const s = (vars) => {
      const keys = Object.keys(vars);
      return keys.reduce((str, k) => {
        const v = vars[k];
        return str.replace('{' + k + '}', v);
      }, str);
    };
    s.toString = s.valueOf = () => {
      return str;
    };
    return s;
  }
}
