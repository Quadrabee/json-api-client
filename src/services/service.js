import Observable from '../observable';

export default class Service extends Observable {

  constructor({ client }) {
    super();
    this.client = client;
  }

  get name() {
    const name = this.constructor.name;
    return name
      .substr(0, name.indexOf('Service'))
      .toLowerCase();
  }

  /**
   * Any service requiring a particular initialization during the load of the
   * app should override this method.
   *
   * @return Promise
   */
  initialize() {
    return Promise.resolve();
  }

  // Override Observable#emit's default behaviour
  emit(event, payload) {
    super.emit(event, payload);
    this.client.emit(`${this.name}:${event}`, payload);
  }

}
