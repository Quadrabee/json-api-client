import { Collection } from '../jsonapi';
import Service from './service';

export default class AdminService extends Service {

  getDepartments() {
    const { api } = this.client;
    const loader = () => {
      return api.AdminService.getDepartments();
    };
    loader.rebind = (args) => {
      return api.AdminService.getDepartments.rebind(args);
    };
    const c = new Collection(loader);
    c.load();
    return c;
  }

  createDepartment(name) {
    const { api } = this.client;
    const params = { name };
    return api.AdminService.createDepartment(params)
      .then(() => this.emit('department:created', params));
  }

  updateDepartment(id, name) {
    const { api } = this.client;
    const params = { id, name };
    return api.AdminService.updateDepartment(params)
      .then(() => this.emit('department:updated', params));
  }

  removeDepartment(id) {
    const { api } = this.client;
    const params = { id };
    return api.AdminService.removeDepartment(params)
      .then(() => this.emit('department:removed', params));
  }

  getTeams() {
    const { api } = this.client;
    const loader = () => {
      return api.AdminService.getTeams();
    };
    loader.rebind = (args) => {
      return api.AdminService.getTeams.rebind(args);
    };
    const c = new Collection(loader);
    c.load();
    return c;
  }

  createTeam(name, departmentId) {
    const { api } = this.client;
    const params = { name, departmentId };
    return api.AdminService.createTeam(params)
      .then(() => this.emit('team:created', params));
  }

  removeTeam(id) {
    const { api } = this.client;
    const params = { id };
    return api.AdminService.removeTeam(params)
      .then(() => this.emit('team:removed', params));
  }

  updateTeam(id, name) {
    const { api } = this.client;
    const params = { id, name };
    return api.AdminService.updateTeam(params)
      .then(() => this.emit('team:updated', params));
  }

  createUser(params) {
    const { api } = this.client;
    return api.AdminService.createUser(params)
      .then(() => this.emit('user:created', params));
  }

  updateUser(params) {
    const { api } = this.client;
    return api.AdminService.updateUser(params)
      .then(() => this.emit('user:updated', params));
  }

  removeUser(params) {
    const { api } = this.client;
    return api.AdminService.removeUser(params)
      .then(() => this.emit('user:deleted', params));
  }

  sendUserInvite(id) {
    const { api } = this.client;
    const params = { id };
    return api.AdminService.sendUserInvite(params)
      .then(() => this.emit('user:invited', params));
  }
}
