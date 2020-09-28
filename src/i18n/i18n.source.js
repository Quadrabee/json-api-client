export default class I18NSource {
  /**
   * Any kind of source relying on asynchronous behaviour/initialization
   * should override this method
   */
  initialize() {
    return Promise.resolve();
  }

  /**
   * Loads a new locale and returns a Promise with the translations
   * @return Promise
   */
  load(locale) {
    throw new Error('Not implemented');
  }
}
