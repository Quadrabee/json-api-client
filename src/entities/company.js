import { Entity } from '../jsonapi';
import RiskProfile from './riskProfile';
import _ from 'lodash';

export default class Company extends Entity {

  isInMyPortfolio() {
    return this.data.meta.inMyPortfolio;
  }

  hasFinancialHistory() {
    return _.findIndex(this.attributes.history.map(x => x.financial)) >= 0;
  }

  hasRiskHistory() {
    return _.findIndex(this.attributes.history.map(x => x.riskProfile)) >= 0;
  }

  hasFinancialAttribut(year) {
    return _.has(this.attributes.history[year], 'financial');
  }

  getFinancialField(year, field) {
    return _.at(this.attributes, `history[${year}].financial[${field}]`)[0];
  }

  getSubrisksHistory() {
    return _(this.attributes.history)
      .map((year) => {
        if (!year.riskProfile) {
          return;
        }
        return {
          year: year.year,
          subrisks: year.riskProfile.attributes.subrisks.reduce((acc, s) => {
            acc[s.attributes.name] = s.attributes.score;
            return acc;
          }, {})
        };
      })
      .compact()
      .value();
  }

  get europeanVAT() {
    return this.getIdentifiersField('europeanVAT');
  }

  getIdentifiersField(field) {
    return _.get(_.find(this.attributes.identifiers, i => i.name === field), 'value');
  }

  dress(itemDoc, subEntities = {}) {
    return super.dress(itemDoc, Object.assign({}, subEntities, {
      'attributes.last.riskProfile': RiskProfile
    }));
  }

}
