import _ from 'lodash';

export default class ApiUtils {
  static concat(...args) {
    return _.tail(args).reduce((memo, part) => {
      const prefix = (memo || '').replace(/\/$/, '');
      const suffix = (part || '').replace(/^\//, '');
      return prefix + '/' + suffix;
    }, args[0]);
  }

  static url(baseUrl, ...args) {
    let href = baseUrl;
    if (baseUrl instanceof URL) {
      href = baseUrl.href;
    }
    const fullUrl = ApiUtils.concat(href, ...args);
    return new URL(fullUrl);
  }

  static replaceParams(uri, args) {
    const link = uri.split('?');
    const searchParams = new URLSearchParams();
    _.map(args, (value, key) => {
      const str = value || value === 0 || value === false ? value.toString().trim() : null;
      if (str) {
        searchParams.set(key, str);
      }
    });
    return decodeURI(`${link[0]}?${searchParams.toString()}`);
  }
}
