import Endpoint from './endpoint';
import ApiUtils from './utils';
import Drivers from './drivers';

export default class Service {
  constructor({ name, endpoints, api, path, client, interceptors }) {
    this.name = name;
    this.endpoints = endpoints || {};
    this.api = api;
    this.path = path || name;
    this.client = client;
    this._interceptors = interceptors || [];
  }

  get interceptors() {
    return [...new Set([...this._interceptors, ...this.api.interceptors])];
  }

  get driver() {
    return this.api.driver || Drivers.DEFAULT;
  }

  getUrl() {
    return ApiUtils.url(this.api.getUrl(), this.path);
  }

  addEndpoint(name, endpointDef) {
    const endpoint = new Endpoint({ name, ...endpointDef, service: this });
    this.endpoints[name] = endpoint;
    this[name] = endpoint.call.bind(endpoint);
    this[name].rebind = this.api.rebind.bind(this.api);
    return endpoint;
  }
}
