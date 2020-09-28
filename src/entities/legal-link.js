import { Entity } from '../jsonapi';
import Company from './company';

export default class LegalLink extends Entity {

  dress(itemDoc, subEntities = {}) {
    return super.dress(itemDoc, Object.assign({}, subEntities, {
      'attributes.target': Company,
      'attributes.source': Company
    }));
  }

}
