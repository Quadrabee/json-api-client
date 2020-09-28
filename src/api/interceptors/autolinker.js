import Interceptor from './interceptor';

class Autolinker extends Interceptor {
  constructor({ client, force }) {
    super({ client });
    this.force = force;
  }

  onAfterRequest(response) {
    if (response.config.method === 'get' && response.status === 200) {
      const envelope = response.data;
      if (envelope && envelope.data && (!envelope.links || !envelope.links.self || this.force)) {
        envelope.links = envelope.links || {};
        envelope.links.self = response.config.url.replace(/^\/api\//, '/');
        envelope.meta = envelope.meta || {};
      }
    }
    return Promise.resolve(response);
  }
}

export default Autolinker;
