import Interceptor from './interceptor';

class TokenInjector extends Interceptor {
  constructor({ client, tokenField }) {
    super({ client });
    this.tokenField = tokenField;
  }

  onBeforeRequest(params) {
    const token = this.client.getStorage().get('token');
    if (!token) {
      return Promise.resolve(params);
    }
    params.headers = params.headers || {};
    params.headers[this.tokenField] = token;
    return Promise.resolve(params);
  }
}

export default TokenInjector;
