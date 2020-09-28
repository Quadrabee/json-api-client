/**
 * Returns the value situated at 'path' on 'object'
 * Ex: at({ foo: { bar: 'baz' }}, 'foo.bar') === 'baz'
 * @param { } obj
 * @param {*} path
 */
export const at = (obj, path) => {
  return path
    .split('.')
    .reduce((o, p) => {
      return o && o[p] ? o[p] : null;
    }, obj);
};

/**
 * Turns an object containing dotted keys to a full object hierarchy.
 * Ex: treeNormalize({ 'components.search.SearchBar': {}}) becomes:
 *     { components: { search: { SearchBar: {} } } }
 */
export const treeNormalize = (obj) => {
  return Object.keys(obj).reduce((o, k) => {
    const value = obj[k];
    const parts = k.split('.');
    const lastPart = parts.pop();
    const dest = parts.reduce((o, p) => {
      if (!o[p]) {
        o[p] = {};
      }
      return o[p];
    }, o);
    if (dest[lastPart]) {
      throw new Error(`Unable to normalize tree, conflictual paths detected: ${k}`);
    }
    dest[lastPart] = value;
    return o;
  }, {});
};
