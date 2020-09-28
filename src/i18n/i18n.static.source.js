import I18NSource from './i18n.source';

export default class I18NStaticSource extends I18NSource {
  #translations;

  constructor(translations) {
    super();
    this.#translations = translations;
  }

  load(locale) {
    return Promise.resolve(this.#translations[locale]);
  }
}
