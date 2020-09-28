import { Entity } from '../jsonapi';
import Service from './service';

export default class OpenGraphService extends Service {

  getArticle(url) {
    const { api } = this.client;
    const base64Url = btoa(url);
    const loader = () => {
      return api.OpenGraphService.getArticle({ url: encodeURIComponent(base64Url) });
    };
    loader.rebind = (args) => {
      return api.OpenGraphService.getArticle.rebind(args);
    };
    const c = Entity.factor(loader);
    c.load();
    return c;
  }
}
