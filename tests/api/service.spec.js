import { expect } from 'chai';
import { Service, Endpoint } from '../../src/api';

describe('the Service class', () => {
  describe('#getUrl', () => (
    it('constructs a full URL using the API baseURL and the Service url')
  ));

  describe('#addEndpoint', () => {
    const mockApi = {
      rebind: function() {}
    };
    let service;
    beforeEach(() => {
      service = new Service({ name: 'AuthService', api: mockApi });
    });

    it('returns an Endpoint instance', () => {
      const endp = service.addEndpoint('bar', { method: 'GET', path: '/bar' });
      expect(endp).to.be.an.instanceof(Endpoint);
    });

    it('adds the endpoint to the list of endpoints', () => {
      const endp = service.addEndpoint('bar', { method: 'GET', path: '/bar' });
      expect(service.endpoints.bar).to.equal(endp);
    });

    it('passes the correct reference to the service instance', () => {
      const endp = service.addEndpoint('bar', { method: 'GET', path: '/bar' });
      expect(endp.service).to.equal(service);
    });
  });
});
