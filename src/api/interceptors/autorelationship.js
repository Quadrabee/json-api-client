import Interceptor from './interceptor';
import ApiUtils from '../utils';

class AutoRelationship extends Interceptor {
  constructor({ client, name, suffix, type }) {
    super({ client });
    this.name = name;
    this.suffix = suffix;
    this.type = type;
  }

  onAfterRequest(response, endpoint) {
    if (response.config.method === 'get' && response.status === 200) {
      const envelope = response.data;
      if (envelope.data) {
        envelope.data.relationships = envelope.data.relationships || {};
        if (!envelope.data.relationships[this.name]) {
          const apiBaseUrl = endpoint.api.baseUrl;
          const base = response.config.url.replace(apiBaseUrl, '/');
          const selfLinkUrl = ApiUtils.concat(base, this.suffix);
          envelope.data.relationships[this.name] = {
            data: { type: this.type },
            links: { self: selfLinkUrl }
          };
        }
      }
    }
    return Promise.resolve(response);
  }
}

export default AutoRelationship;
