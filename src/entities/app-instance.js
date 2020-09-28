import { Entity } from '../jsonapi';
import _ from 'lodash';

export default class AppInstance extends Entity {

  supportsCreditSafe() {
    return _.get(this, 'document.databases.data.meta.Source') === 'CreditSafe';
  }

  version() {
    return this.document.instance.version.split('.').splice(0, 4).join('.');
  }

}
