import { Endpoint } from '../../src/api';
import moxios from 'moxios';
import sinon from 'sinon';
import chai, { expect } from 'chai';

import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('the Endpoint class', () => {
  const mockService = {
    getUrl: sinon.stub().returns('http://foo/bar')
  };

  let endpoint;
  beforeEach(() => {
    moxios.install();
    endpoint = new Endpoint({
      name: 'login',
      method: 'POST',
      path: 'baz',
      service: mockService
    });
  });

  afterEach(() => {
    moxios.uninstall();
  });

  it('returns a Promise', () => {
    const p = endpoint.call({ foo: 'bar' });
    expect(p).to.be.an.instanceOf(Promise);
  });

  it('calls axios with the correct parameters', (done) => {
    const data = { foo: 'bar' };
    endpoint.call(data);
    moxios.wait(() => {
      const req = moxios.requests.mostRecent();
      expect(req.config.url).to.equal('http://foo/bar/baz');
      expect(req.config.method).to.equal('post');
      expect(req.config.data).to.equal(JSON.stringify(data));
      expect(req.config.headers['Content-Type']).to.include('application/json');
      done();
    });
  });

  it('resolves the promise, passing the response\'s body, if axios succeeds', (done) => {
    const p = endpoint.call({ foo: 'bar' });
    moxios.wait(() => {
      const req = moxios.requests.mostRecent();
      req.respondWith({
        status: 200,
        response: { ok: true }
      });
    });
    p.then((data) => {
      expect(data).to.deep.equal({ ok: true });
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('rejects the promise if axios fails', (done) => {
    const p = endpoint.call({ foo: 'bar' });
    const err = new Error('something went south');
    moxios.wait(() => {
      const req = moxios.requests.mostRecent();
      req.reject(err);
    });
    p.then((data) => {
      done(new Error('should have failed'));
    }).catch((err) => {
      expect(err).to.equal(err);
      done();
    });
  });

  // TODO
  it('rejects the promise with the API error message when present');

  describe('calls the interceptors before sending the request, when present', () => {
    let mockInterceptor;
    beforeEach(() => {
      mockInterceptor = {
        onBeforeRequest: sinon.stub().returns(Promise.resolve({
          headers: {
            'FOO': 'BAR'
          }
        }))
      };
      endpoint.interceptors.push(mockInterceptor);
    });

    it('calls the #onBeforeRequest of the interceptors', (done) => {
      endpoint.call({ data: 2 });
      moxios.wait(() => {
        expect(mockInterceptor.onBeforeRequest).to.be.calledOnceWith();
        done();
      });
    });

    it('uses the results from interceptors', (done) => {
      endpoint.call({ data: 2 });
      moxios.wait(() => {
        const req = moxios.requests.mostRecent();
        expect(req.config.headers.FOO).to.equal('BAR');
        done();
      });
    });
  });
});
