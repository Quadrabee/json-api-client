import _ from 'lodash';
import { Entity } from '../jsonapi';
import Company from './company';

export default class MonitoredCompany extends Entity {

  getRiskGlobal() {
    return _.filter(this.attributes.globalHistory, r => r.score != null);
  }

  dress(itemDoc, subEntities = {}) {
    return super.dress(itemDoc, Object.assign({}, subEntities, {
      'attributes.company': Company
    }));
  }

}
