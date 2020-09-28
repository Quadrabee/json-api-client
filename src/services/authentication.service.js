import { Entity } from '../jsonapi';
import Service from './service';
import { UserProfile } from '../entities';

export default class AuthenticationService extends Service {
  constructor({ client }) {
    super({ client });
    this._profile = null;
    this.on('loggedOut', () => {
      this._profile = null;
    });
  }

  get me() {
    return this._profile;
  }

  loadProfile() {
    if (!this.isLoggedIn()) {
      return Promise.reject(new Error('User not authenticated'));
    }
    if (this._profile) {
      return Promise.resolve(this._profile);
    }
    return this.client.api.MyService.profile()
      .then((res) => {
        this._profile = Entity.factor(res, null, UserProfile);
        return this._profile;
      })
      .catch((e) => {
        this.logout();
        throw e;
      });
  }

  isLoggedIn() {
    return !!this.client.getStorage().get('token');
  }

  login(username, pwd) {
    const { api } = this.client;
    return api.AuthenticationService
      .login({
        login: username,
        password: pwd
      })
      .then((res) => {
        this.client.getStorage().set('token', res.token_type + ' ' + res.access_token);
        this.emit('loggedIn');
        return this.loadProfile();
      })
      .then(() => true);
  }

  logout() {
    const { api } = this.client;
    let error;
    return api.AuthenticationService
      .logout({})
      .catch((err) => {
        // Track error and bubble up, after
        // token removal
        error = err;
      })
      .then(() => {
        this.client.getStorage().set('token', null);
        this.emit('loggedOut');
        // bubble up previous error
        if (error) {
          throw error;
        }
      });
  }

  forgottenPassword(mail) {
    const { api } = this.client;
    return api.AuthenticationService.forgotPassword({ mail });
  }

  resetPassword(password, token) {
    const { api } = this.client;
    return api.AuthenticationService.resetPassword({ password, token });
  }

  getTokenValidity(token) {
    const { api } = this.client;
    return api.AuthenticationService.validateToken({ token });
  }

  activateUser(params) {
    const { api } = this.client;
    return api.AuthenticationService.activateUser(params);
  }
}
