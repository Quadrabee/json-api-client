import _ from 'lodash';
import ApiUtils from './utils';
import Drivers from './drivers';
import Qs from 'qs';

const PARAMS_REGEX = /:([a-zA-Z_]+)/g;

export default class Endpoint {
  constructor({ name, method, path, service, interceptors, client }) {
    this.name = name;
    this.client = client;
    this.method = method;
    this.path = path || name;
    this.service = service;
    this._interceptors = interceptors || [];
  }

  get api() {
    return this.service.api;
  }

  get driver() {
    return this.service.driver || Drivers.DEFAULT;
  }

  get interceptors() {
    if (this.service.interceptors) {
      return [...new Set([...this._interceptors, ...this.service.interceptors])];
    } else {
      return this._interceptors;
    }
  }

  matches(path) {
    path = path.replace(/\/$/, '');
    const pattern = this.getUrl()
      .pathname
      .replace(/\/$/, '')
      .replace(/\//g, '\\/')
      .replace(PARAMS_REGEX, '([\\w\\d-_]+)');
    const regex = new RegExp(`^${pattern}$`);
    const match = regex.exec(path);
    if (match) {
      const values = match.slice(1, match.length);
      return {
        endpoint: this,
        params: _.zipObject(this.urlParams, values)
      };
    }
  }

  generateUrlAndData(data = {}) {
    const urlParams = this.urlParams;
    const url = urlParams.reduce((url, param) => {
      return url.replace(`:${param}`, data[param]);
    }, this.getUrl().href);
    const newData = Object.keys(data).reduce((acc, param) => {
      if (urlParams.indexOf(param) < 0) {
        acc[param] = data[param];
      }
      return acc;
    }, {});
    return { url, data: newData };
  }

  get urlParams() {
    const url = this.getUrl().pathname;
    const matches = url.match(PARAMS_REGEX);
    if (matches) {
      return matches.map(s => s.substr(1));
    }
    return [];
  }

  hasUrlParams() {
    return this.urlParams.length > 0;
  }

  getUrl() {
    return ApiUtils.url(this.service.getUrl(), this.path);
  }

  onBeforeRequest(params) {
    return this.interceptors.reduce((prev, interceptor) => {
      return prev.then((params) => interceptor.onBeforeRequest(params, this));
    }, Promise.resolve(params));
  }

  onAfterRequest(response) {
    return this.interceptors.reduce((prev, interceptor) => {
      return prev.then((response) => interceptor.onAfterRequest(response, this));
    }, Promise.resolve(response));
  }

  onError(err) {
    return this.interceptors.reduce((prev, interceptor) => {
      return prev.then((err) => interceptor.onError(err, this));
    }, Promise.resolve(err));
  }

  call(args) {
    const { url, data } = this.generateUrlAndData(args);

    const payload = {
      url,
      method: this.method,
      paramsSerializer: function(params) {
        return Qs.stringify(params, { arrayFormat: 'brackets' });
      }
    };

    if (this.method.toUpperCase() === 'GET') {
      payload.params = data;
    } else {
      payload.data = data;
    }
    return this.onBeforeRequest(payload)
      .then(payload => this.driver.request(payload))
      .then(res => this.onAfterRequest(res))
      .then(res => res.data)
      .catch(err => {
        const { response } = err;
        return this.onError(err)
          .then(() => {
            if (response && response.data && response.data.Message) {
              throw new Error(response.data.Message);
            }
            throw err;
          });
      });
  }
}
