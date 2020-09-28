import axios from 'axios';
import I18NSource from './i18n.source';

export default class I18NRemoteStaticSource extends I18NSource {
  #baseUrl;
  #loading;
  #translations;
  #namespace;

  constructor({ baseUrl, namespace }) {
    super();
    this.#baseUrl = baseUrl;
    this.#loading = false;
    this.#translations = {};
    this.#namespace = namespace;
    if (namespace) {
      this.#translations[namespace] = {};
    }
  }

  load(locale, force = false) {
    if (!locale) {
      throw new Error('Locale expected, none given');
    }
    if (this.#translations[locale] && !force) {
      return Promise.resolve(this.#translations[locale]);
    }
    if (this.#loading) {
      return this.#loading;
    }
    this.#loading = axios.get(this.#baseUrl.replace('{locale}', locale))
      .then((res) => {
        if (this.#namespace) {
          this.#translations[locale] = {};
          this.#translations[locale][this.#namespace] = res.data;
        } else {
          this.#translations[locale] = res.data;
        }
        this.#loading = null;
        return this.#translations[locale];
      });
    return this.#loading;
  }
}
