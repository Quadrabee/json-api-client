import { Entity } from '../jsonapi';
import MediaLink from './mediaLink';

export default class RiskAnalysis extends Entity {

  dress(itemDoc, subEntities = {}) {
    return super.dress(itemDoc, Object.assign({}, subEntities, {
      'attributes.mediaLinks': MediaLink
    }));
  }

}
