import _ from 'lodash';
import { I18NSource, TranslationGroup } from '../i18n';
import { treeNormalize, at } from '../utils/namespaces';
import Service from './service';

const DEFAULT_LOCALE = 'en-US';

export default class i18nService extends Service {
  #sources;
  #groups;
  #locale;
  #translations;

  constructor({ client, locale }) {
    super({ client });
    this.#sources = [];
    this.#locale = locale;
    this.#groups = {};
    this.#translations = {};
  }

  initialize() {
    const auth = this.client.AuthenticationService;

    this.client.on('authentication:loggedIn', () => {
      this._setLocaleFromUserPreferences();
    });

    if (auth.isLoggedIn()) {
      return this._setLocaleFromUserPreferences()
        .then(() => super.initialize());
    } else {
      this.locale = DEFAULT_LOCALE;
      return super.initialize();
    }
  }

  _setLocaleFromUserPreferences() {
    const api = this.client.api;
    return api.MyService.getPreferences()
      .then((res) => {
        const { attributes: { locale } } = res.data;
        this.locale = locale;
        return res.data;
      })
      .catch(() => {
        this.locale = DEFAULT_LOCALE;
      });
  }

  get locale() {
    return this.#locale;
  }

  set locale(locale) {
    const { client: { api } } = this;
    const previousLocale = this.#locale;
    this.#locale = locale;
    this._reloadSources();
    if (previousLocale && locale !== previousLocale) {
      api.MyService.setPreferences({
        type: 'User.Preferences',
        attributes: {
          locale: locale
        }
      });
    }
  }

  get groups() {
    return this.#groups;
  }

  getGroup(namespace) {
    return namespace.split('.').reduce((groups, key) => {
      if (!groups || !groups[key]) {
        return null;
      }
      return groups[key];
    }, this.#groups);
  }

  addGroup(group) {
    if (!(group instanceof TranslationGroup)) {
      throw new Error(`TranslationGroup expected, got ${group}`);
    }
    const { namespace } = group;
    const translations = _.get(this.#translations, namespace);
    group.setTranslations(translations || {});

    const parts = namespace.split('.');
    const path = [];
    parts.reduce((o, p, i) => {
      path.push(p);
      if (i === parts.length - 1) {
        if (o[p]) {
          throw new Error(`Cannot override existing group at '${path.join('.')}'`);
        }
        o[p] = group;
      } else if (!o[p]) {
        o[p] = {};
      }
      return o[p];
    }, this.#groups);
  }

  addSource(source) {
    const sources = [].concat(source);
    sources.forEach((s) => {
      if (!(s instanceof I18NSource)) {
        throw new Error('I18NSource instance expected');
      }
      this.#sources.push(s);
    });
  }

  _reloadSources() {
    const promises = this.#sources.map((s) => {
      return s.load(this.#locale)
        .catch(() => {
          console.warn('Source load failed', s);
          return {};
        });
    });
    return Promise.all(promises)
      .then((results) => {
        return results.reduce((o, trs) => {
          return Object.keys(trs).reduce((o, k) => {
            o[k] = trs[k];
            return o;
          }, o);
        }, {});
      })
      .then((trs) => {
        this.#translations = treeNormalize(trs);
        this._refreshGroups();
      });
  }

  _refreshGroups() {
    const walkThrough = (obj, prefix, fn) => {
      Object.keys(obj).forEach((k) => {
        const ns = prefix ? `${prefix}.${k}` : k;
        const v = obj[k];
        if (v instanceof TranslationGroup) {
          fn(ns, v);
        } else if (v instanceof Object) {
          walkThrough(v, ns, fn);
        }
      });
    };
    walkThrough(this.#groups, null, (ns, group) => {
      const trans = at(this.#translations, ns) || {};
      group.setTranslations(trans);
    });
  }
}
