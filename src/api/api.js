import _ from 'lodash';
import Service from './service';
import ApiUtils from './utils';
import Drivers from './drivers';

export default class Api {
  constructor({ baseUrl, interceptors, driver }) {
    this.baseUrl = baseUrl;
    this.services = {};
    this.driver = driver || Drivers.DEFAULT;
    this.interceptors = interceptors || [];
  }

  getUrl() {
    return this.baseUrl;
  }

  addService(name, config) {
    const service = new Service({ name, ...config, api: this });
    this.services[name] = service;
    this[name] = service;
    return service;
  }

  findEndpointByUrl(url) {
    const endp = _(this.services)
      .map((svc) => _.values(svc.endpoints))
      .flatten()
      .value()
      .find((endp) => {
        return endp.matches(url.pathname);
      });
    if (endp) {
      return endp.matches(url.pathname);
    }
  }

  rebind(rebindUrl) {
    const url = ApiUtils.url(this.baseUrl, rebindUrl);
    const match = this.findEndpointByUrl(url);
    if (match) {
      const urlParams = Object.fromEntries(url.searchParams.entries());
      const reloader = (data) => {
        const payload = _.merge({}, match.params, urlParams, data);
        return match.endpoint.call(payload);
      };
      reloader.rebind = this.rebind.bind(this);
      return reloader;
    } else {
      return null;
      // throw new Error(`Unable to rebind url: ${rebindUrl}`);
    }
  }

  static fromJsonDef(json, client) {
    const { baseUrl } = json;
    const api = new Api({ baseUrl, client, ...json });
    const serviceNames = Object.keys(json.services || {});
    serviceNames.forEach((name) => {
      const srvDef = json.services[name];
      const service = api.addService(name, { client, ...srvDef });

      const endpointNames = Object.keys(srvDef.endpoints || {});
      endpointNames.forEach(endpName => {
        const endp = srvDef.endpoints[endpName];
        service.addEndpoint(endpName, { ...endp, client });
      });
    });
    return api;
  }
}
