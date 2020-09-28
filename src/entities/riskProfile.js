import { Entity } from '../jsonapi';
import RiskIndicator from './riskIndicator';

export default class RiskProfile extends Entity {
  dress(itemDoc, subEntities = {}) {
    return super.dress(itemDoc, Object.assign({}, subEntities, {
      'attributes.subrisks': RiskIndicator
    }));
  }
}
