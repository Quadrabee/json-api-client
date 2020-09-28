import { expect } from 'chai';
import { Api, Service, Endpoint } from '../../src/api';

describe('the Api class', () => {
  describe('#addService', () => {
    let api;
    beforeEach(() => {
      api = new Api({ baseUrl: 'http://foo' });
    });

    it('returns a Service instance', () => {
      const s = api.addService('bar');
      expect(s).to.be.an.instanceof(Service);
    });

    it('adds the service to the list of services', () => {
      const s = api.addService('bar');
      expect(api.services.bar).to.equal(s);
    });

    it('passes the correct reference to the api object', () => {
      const s = api.addService('bar');
      expect(s.api).to.equal(api);
    });
  });

  describe('.fromJsonDef', () => {
    it('returns an Api instance', () => {
      const api = Api.fromJsonDef({
        baseUrl: 'http://foo',
        services: {
        }
      });
      expect(api).to.be.an.instanceof(Api);
    });

    it('supports empty list of services', () => {
      const api = Api.fromJsonDef({
        baseUrl: 'http://foo'
      });
      expect(api).to.be.an.instanceof(Api);
    });

    it('creates one Service instance per service definition', () => {
      const api = Api.fromJsonDef({
        baseUrl: 'http://foo',
        services: {
          AuthService: {
          },
          AccountService: {
          }
        }
      });
      expect(api.services.AuthService).to.be.an.instanceof(Service);
      expect(api.services.AccountService).to.be.an.instanceof(Service);
    });

    it('adds the endpoint to the created Services', () => {
      const api = Api.fromJsonDef({
        baseUrl: 'http://foo',
        services: {
          AuthService: {
            endpoints: {
              login: {
                method: 'POST'
              }
            }
          }
        }
      });
      const { AuthService } = api.services;
      expect(AuthService.endpoints.login).to.be.an.instanceof(Endpoint);
    });
  });
});
