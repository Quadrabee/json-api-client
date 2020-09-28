import { Entity } from '../jsonapi';
import User from './user-profile';

export default class Team extends Entity {
  dress(itemDoc, subEntities = {}) {
    return super.dress(itemDoc, Object.assign({}, subEntities, {
      'attributes.teamManager': User,
      'attributes.users': User
    }));
  }
}
