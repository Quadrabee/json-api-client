class Interceptor {
  constructor({ client }) {
    this.client = client;
  }

  onBeforeRequest(params) {
    return Promise.resolve(params);
  }

  onAfterRequest(response) {
    return Promise.resolve(response);
  }

  onError(response) {
    return Promise.resolve(response);
  }
}

export default Interceptor;
