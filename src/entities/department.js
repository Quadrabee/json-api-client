import { Entity } from '../jsonapi';
import User from './user-profile';
import Team from './team';

export default class Department extends Entity {

  dress(itemDoc, subEntities = {}) {
    return super.dress(itemDoc, Object.assign({}, subEntities, {
      'attributes.departmentLeader': User,
      'attributes.teams': Team
    }));
  }

}
