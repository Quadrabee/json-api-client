import Service from './service';
import { Entity } from '../jsonapi';
import { RiskIndicator } from '../entities';
import { transformToMap } from '../utils/transform';

export default class TransparencyService extends Service {
  getGeographicalRisk() {
    const { api } = this.client;
    const loader = () => {
      return api.TransparencyService.getGeographicalRisk()
        .then((res) => {
          return Object.assign({}, res, {
            data: {
              meta: res.data[0].attributes.lastUpdate,
              values: transformToMap(res.data, 'attributes.country', 'attributes.score')
            }

          });
        });
    };
    loader.rebind = (args) => {
      return api.TransparencyService.getGeographicalRisk.rebind(args);
    };
    const c = new Entity(null, loader);
    c.load();
    return c;
  }

  getGeographicalRiskHistory(country) {
    const { api } = this.client;
    const loader = () => {
      return api.TransparencyService.getGeographicalRiskHistory({ country: country });
    };
    loader.rebind = (args) => {
      return api.TransparencyService.getGeographicalRiskHistory.rebind(args);
    };
    const c = Entity.factor(null, loader, RiskIndicator);
    c.load();
    return c;
  }
}
