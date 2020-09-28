import Service from './service';
import { Collection } from '../jsonapi';
import { transformToMap } from '../utils/transform';

export const SEARCH_MODE_PERSON = 'Person';
export const SEARCH_MODE_COMPANY = 'Company';

export default class SearchService extends Service {
  /**
   * Make a particular search and returns a JsonAPI Collection with
   * the results.
   *
   * When `search` is defined, the collection load is ongoing in silent
   * mode when the collection is returned. Otherwise a Collection
   * is returned but no actual backend call is done.
   *
   * @param search: Search with type=T
   * @return Collection<T>
   */
  search(search) {
    if (search.attributes.mode === 'Company') {
      return this.searchCompanies(search);
    } else if (search.attributes.mode === 'Person') {
      return this.searchPeople(search);
    } else {
      throw new Error('Not implemented');
    }
  }

  /**
   * Specialization of `search` for easier implementation by subclasses.
   *
   * @param search: Search(s | s.attributes.mode == 'Company' )
   * @return Collection<Company>
   */
  searchCompanies(search) {
    const { api } = this.client;
    const loader = (search) => {
      return api.EntitiesService.searchCompanies({
        q: search.attributes.q,
        country: search.attributes.country,
        group: search.attributes.group,
        'page[size]': 15
      }).then(res => {
        return Object.assign({}, res, {
          data: res.data.map(r => {
            r.attributes.activity = transformToMap(r.attributes.activity, 'name', 'value');
            return r;
          })
        });
      });
    };
    loader.rebind = (args) => {
      return api.EntitiesService.searchCompanies.rebind(args);
    };
    const c = new Collection(loader);
    if (search && search.attributes && (search.attributes.q || search.attributes.country || search.attributes.group)) {
      c.load(search, true);
    }
    return c;
  }

  /**
   * Specialization of `search` for easier implementation by subclasses.
   *
   * @param search: Search(s | s.attributes.mode == 'Person' )
   * @return Collection<Person>
   */
  searchPeople(search) {
    const { api } = this.client;
    const loader = (search) => {
      return api.EntitiesService.searchPeople({
        q: search.attributes.q
      });
    };
    loader.rebind = (args) => {
      return api.EntitiesService.searchPeople.rebind(args);
    };
    const c = new Collection(loader);
    if (search && search.attributes && search.attributes.q) {
      c.load(search, true);
    }
    return c;
  }

  /**
   * Returns the current's user search history as a Collection.
   *
   * POST: returned collection should be loaded in silent mode.
   * @param mode: Search.Mode (s | s == 'Person' || s == 'Company' )
   * @return Collection<Search>
   */
  getSearchHistory(mode) {
    const { api } = this.client;
    const loader = () => {
      return api.MyService.searchHistory({ mode });
    };
    const c = new Collection(loader);
    c.load();
    return c;
  }

  /**
   * Push a search history entry into the stack of recent searches.
   *
   * @param search: Search.Create
   * @return a Promise that resolves on success and rejects on failure.
   */
  pushSearchHistory(search) {
    const { api } = this.client;
    return api.MyService.pushToHistory(search.document.data);
  }

  /** Instance getters for constants */
  get SEARCH_MODE_COMPANY() { return SEARCH_MODE_COMPANY; }
  get SEARCH_MODE_PERSON() { return SEARCH_MODE_PERSON; }
}
