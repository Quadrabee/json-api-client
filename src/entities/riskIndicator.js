import _ from 'lodash';
import { Entity } from '../jsonapi';
import { RiskAnalysis } from '../entities';

export default class RiskIndicator extends Entity {

  dress(itemDoc, subEntities = {}) {
    return super.dress(itemDoc, Object.assign({}, subEntities, {
      'attributes.details.analyses': RiskAnalysis
    }));
  }

  getRiskHistory() {
    return _.filter(this.attributes.history, r => r.score != null);
  }

}
