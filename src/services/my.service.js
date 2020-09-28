import Service from './service';
import { Collection, Entity } from '../jsonapi';
import { transformToMap } from '../utils/transform';

export default class MyService extends Service {
  addRecentlyBrowsedCompanies(id) {
    const { api } = this.client;
    return api.MyService.pushToBrowseHistory({
      type: 'BrowseHistory',
      attributes: {
        entity: {
          type: 'Company',
          id: id
        }
      }
    });
  }

  getRecentlyBrowsedCompanies() {
    const { api } = this.client;
    const loader = () => {
      return api.MyService.browseHistoryCompanies({ 'page[size]': 15 }).then((res) => {
        const data = res.data.map((r) => {
          r.attributes.entity.attributes.activity = transformToMap(r.attributes.entity.attributes.activity, 'name', 'value');
          return r.attributes.entity;
        });
        return { data: data, links: { self: '/v1/entities/companies/' }, meta: res.meta };
      });
    };
    loader.rebind = (args) => {
      return api.EntitiesService.searchCompanies.rebind(args);
    };
    const c = new Collection(loader);
    c.load({}, true);
    return c;
  }

  addRecentlyBrowsedPeople(id) {
    const { api } = this.client;
    return api.MyService.pushToBrowseHistory({
      type: 'BrowseHistory',
      attributes: {
        entity: {
          type: 'Person',
          id: id
        }
      }
    });
  }

  getRecentlyBrowsedPeople() {
    const { api } = this.client;
    const loader = () => {
      return api.MyService.browseHistoryPeople().then((res) => {
        const data = res.data.map((r) => {
          return r.attributes.entity;
        });
        return { data: data, links: { self: '/v1/entities/people/' } };
      });
    };
    loader.rebind = (args) => {
      return api.EntitiesService.searchPeople.rebind(args);
    };
    const c = new Collection(loader);
    c.load({}, true);
    return c;
  }

  getProfile(joinToken) {
    const { api } = this.client;
    const loader = () => {
      return api.MyService.profile({ joinToken });
    };
    loader.rebind = (args) => {
      return api.MyService.profile.rebind(args);
    };
    const c = Entity.factor(loader);
    c.load();
    return c;
  }

  editProfile(params) {
    const { api } = this.client;
    return api.MyService.editProfile(params);
  }
}
