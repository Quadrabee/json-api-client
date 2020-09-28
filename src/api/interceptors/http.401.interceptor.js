import Interceptor from './interceptor';

class Http401Interceptor extends Interceptor {
  onError(err) {
    const { response } = err;
    if (response && response.status === 401) {
      this.client.getStorage().set('token', null);
      this.client.emit('authentication:loggedOut');
    }

    return Promise.resolve(response);
  }
}

export default Http401Interceptor;
