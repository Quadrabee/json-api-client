import Service from './service';
import { Collection, Entity } from '../jsonapi';

export default class PortfolioService extends Service {

  getPortfolio() {
    const { api } = this.client;
    const loader = () => {
      return api.MyService.getPortfolio();
    };
    loader.rebind = (args) => {
      return api.MyService.getPortfolio.rebind(args);
    };
    const c = new Entity(null, loader);
    c.load();
    return c;
  }

  getPortfolioSubjects(sorts) {
    const { api } = this.client;
    const loader = () => {
      if (!sorts || !sorts.length) {
        return api.MyService.getPortfolioSubjects();
      } else {
        return api.MyService.getPortfolioSubjects({ sort: sorts.toString() });
      }
    };
    loader.rebind = (args) => {
      return api.MyService.getPortfolioSubjects.rebind(args);
    };
    const c = new Collection(null, loader);
    c.load();
    return c;
  }

  addPortfolioSubject(company) {
    const { api } = this.client;
    return api.MyService.addPortfolioSubject({
      type: 'Portfolio.Subject',
      attributes: {
        entity: {
          type: 'Company',
          id: company.id
        }
      }
    }).then(() => {
      company.data.meta.inMyPortfolio = true;
      this.emit('subject:added', company);
      return company;
    });
  }

  deletePortfolioSubject(company) {
    const { api } = this.client;
    const params = { id: company.id };
    return api.MyService.deletePortfolioSubject(params)
      .then(() => {
        company.data.meta.inMyPortfolio = false;
        this.emit('subject:deleted', company);
        return company;
      });
  }

}
