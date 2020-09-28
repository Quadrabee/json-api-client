import { Entity } from '../jsonapi';

export default class UserProfile extends Entity {

  isSuperAdmin() {
    // TODO: fix vocabulary mismatch between frontend<>backend
    return this.roles.includes('SysAdmin');
  }

  isTeamManager() {
    // TODO: fix vocabulary mismatch between frontend<>backend
    return this.roles.includes('DD_ChiefAnalyst');
  }

}
