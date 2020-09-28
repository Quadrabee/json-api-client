import { Entity } from '../jsonapi';
import { AppInstance } from '../entities';
import Service from './service';

export default class AppService extends Service {

  constructor({ client }) {
    super({ client });
    this._instance = null;

    client.on('authentication:loggedIn', () => {
      this.getInstanceInfo(true);
    });
  }

  initialize() {
    if (this.client.AuthenticationService.isLoggedIn()) {
      return this.getInstanceInfo();
    }
    return Promise.resolve();
  }

  get instance() {
    return this._instance;
  }

  getInstanceInfo(force = false) {
    if (this._instance && !force) {
      return Promise.resolve(this._instance);
    }
    return this.client.api.AppService.getInstance()
      .then((res) => {
        this._instance = Entity.factor(res, null, AppInstance);
        this.emit('instance:updated');
        return this._instance;
      });
  }
  
}
