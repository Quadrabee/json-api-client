import { Entity } from '../jsonapi';
import RiskProfile from './riskProfile';

export default class Person extends Entity {

  dress(itemDoc, subEntities = {}) {
    return super.dress(itemDoc, Object.assign({}, subEntities, {
      'attributes.last.riskProfile': RiskProfile
    }));
  }

}
