import Api from './api';
import Services from './services';
import { TranslationGroup } from './i18n';
import Observable from './observable';

export default class FlairClient extends Observable {
  #services;

  constructor() {
    super();

    this.api = Api.createApi(this);
    this.#services = Services.createServices(this);
    Object.keys(this.#services).forEach((svcName) => {
      this[svcName] = this.#services[svcName];
    });
  }

  initialize() {
    const promises = Object.keys(this.#services).map((s) => {
      const svc = this.#services[s];
      return svc.initialize()
        .catch((err) => {
          err.service = svc;
          throw err;
        });
    });
    return Promise.all(promises)
      .catch((err) => {
        console.error('Flair-Client initialization failed because of service', err.service);
        console.error(err);
        throw err;
      });
  }

  ts(component, ts) {
    let group = this.I18NService.getGroup(component);
    if (!group) {
      group = new TranslationGroup({ client: this, namespace: component, defaults: ts });
      this.I18NService.addGroup(group);
    }
    return group;
  }

}
