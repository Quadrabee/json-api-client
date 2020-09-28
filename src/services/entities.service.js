import Service from './service';
import { Entity, Collection } from '../jsonapi';
import { Company, RiskIndicator } from '../entities';
import { transformToMap } from '../utils/transform';

export default class EntitiesService extends Service {

  ApiService = this.client.api.EntitiesService;

  helper(endpoint, clazz = Entity, transform) {
    return (args) => {
      const loader = () => {
        if (transform) {
          return endpoint(args).then(transform);
        }
        return endpoint(args);
      };
      loader.rebind = (args) => {
        return endpoint.rebind(args);
      };
      const c = Entity.factor(null, loader, clazz);
      c.load();
      return c;
    };
  }

  getCompanyRiskById = this.helper(this.ApiService.getCompanyRisk, RiskIndicator, function(res) {
    res.data.attributes.values = transformToMap(res.data, 'country', 'score');
    return res;
  });

  getCompanyById = this.helper(this.ApiService.getCompany, Company, function(res) {
    res.data.attributes.activity = transformToMap(res.data.attributes.activity, 'name', 'value');
    return res;
  });
  getCompanyHistoricalCreditRisk = this.helper(this.ApiService.getCompanyHistoricalCreditRisk, RiskIndicator);
  getCompanyHistoricalRiskIndicatorById = this.helper(this.ApiService.getCompanyHistoricalRiskIndicator, RiskIndicator);
  getPersonById = this.helper(this.ApiService.getPerson);
  getPersonHistoricalRiskIndicatorById = this.helper(this.ApiService.getPersonHistoricalRiskIndicator, RiskIndicator);
  getPersonRelatedCompanies = this.helper(this.ApiService.getPersonRelatedCompanies, Collection);
  getGroupById = this.helper(this.ApiService.getGroup);
  getCompanySubsidiaries = this.helper(this.ApiService.getCompanySubsidiaries, Collection);
  getCompanyShareholders = this.helper(this.ApiService.getCompanyShareholders, Collection);
  getCompanyManagement = this.helper(this.ApiService.getCompanyRelatedPeople, Collection);
}
