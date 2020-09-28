import { stub } from 'sinon';
import { expect } from 'chai';
import { AuthenticationService } from '../../src/services';
import EventEmitter from 'events';

describe('the mock/AuthenticationService service', () => {
  let mockApi, mockClient, mockLoginResult, mockStorage, mockProfile;
  let authenticationService, emitter;
  beforeEach(() => {
    emitter = new EventEmitter();
    mockProfile = {};
    mockLoginResult = {
      token_type: 'Bearer',
      access_token: 'xyz-foo-bar-token-value'
    };
    mockStorage = {
      set: stub().returns(),
      get: stub().returns(`${mockLoginResult.token_type} ${mockLoginResult.access_token}`)
    };
    mockApi = {
      AuthenticationService: {
        login: stub().resolves(mockLoginResult),
        logout: stub().resolves()
      },
      MyService: {
        profile: stub().resolves(mockProfile)
      }
    };
    mockClient = {
      api: mockApi,
      on: emitter.on,
      emit: emitter.emit,
      getStorage: stub().returns(mockStorage)
    };
    authenticationService = new AuthenticationService({ client: mockClient });
  });

  describe('#loadProfile', () => {
    it('raises an error if the user isn\'t logged in', (done) => {
      mockStorage.get.returns(null);
      authenticationService.loadProfile()
        .then(() => {
          done('should have failed');
        })
        .catch((err) => {
          expect(err.message).to.match(/User not authenticated/);
          done();
        });
    });
    it('returns a promise', () => {
      const p = authenticationService.loadProfile();
      expect(p).to.be.an.instanceOf(Promise);
    });
    it('calls the MyService/profile api', (done) => {
      const p = authenticationService.loadProfile();
      p.then(() => {
        expect(mockApi.MyService.profile).to.be.calledOnceWith();
        done();
      });
    });
    it('propagates potential errors from the MyService/profile api', (done) => {
      const err = new Error('oops');
      mockApi.MyService.profile.rejects(err);
      authenticationService.loadProfile()
        .then(() => {
          done('should have failed');
        })
        .catch((error) => {
          expect(error).to.equal(err);
          done();
        });
    });
  });

  describe('#login', () => {
    describe('when successful', () => {
      it('returns a promise', () => {
        const p = authenticationService.login('user', 'pwd');
        expect(p).to.be.an.instanceOf(Promise);
      });
      it('calls the AuthenticationService/login api', (done) => {
        const p = authenticationService.login('user', 'pwd');
        p.then(() => {
          expect(mockApi.AuthenticationService.login).to.be.calledOnceWith({
            login: 'user',
            password: 'pwd'
          });
          done();
        });
      });
      it('saves the token in the storage', (done) => {
        const p = authenticationService.login('user', 'pwd');
        p.then(() => {
          expect(mockStorage.set)
            .to.be.calledOnceWith('token', `${mockLoginResult.token_type} ${mockLoginResult.access_token}`);
          done();
        });
      });
      it('emits the loggedIn event', (done) => {
        mockClient.emit = stub();
        const p = authenticationService.login('user', 'pwd');
        p.then(() => {
          expect(mockClient.emit).to.be.calledOnceWith('authentication:loggedIn');
          done();
        });
      });
      it('loads the profile', (done) => {
        authenticationService.loadProfile = stub();
        const p = authenticationService.login('user', 'pwd');
        p.then(() => {
          expect(authenticationService.loadProfile).to.be.calledOnceWith();
          done();
        });
      });
    });
    describe('when unsucessful', () => {
      it('propagates errors coming from the api', (done) => {
        const err = new Error('oops');
        mockApi.AuthenticationService.login.rejects(err);
        authenticationService.login('user', 'pwd')
          .then(() => {
            done('should have failed');
          })
          .catch((_err) => {
            expect(_err).to.equal(err);
            done();
          });
      });

      it('propagates errors coming from loadProfile', (done) => {
        const err = new Error('oops');
        authenticationService.loadProfile = stub().rejects(err);
        authenticationService.login('user', 'pwd')
          .then(() => {
            done('should have failed');
          })
          .catch((_err) => {
            expect(_err).to.equal(err);
            done();
          });
      });
    });
  });

  describe('#logout', () => {
    describe('when successful', () => {
      it('returns a promise', () => {
        const p = authenticationService.logout();
        expect(p).to.be.an.instanceOf(Promise);
      });
      it('calls the AuthenticationService/logout api', (done) => {
        const p = authenticationService.logout();
        p.then(() => {
          expect(mockApi.AuthenticationService.logout).to.be.calledOnceWith();
          done();
        });
      });
      it('removes the token from the storage', (done) => {
        const p = authenticationService.logout();
        p.then(() => {
          expect(mockStorage.set).to.be.calledOnceWith('token', null);
          done();
        });
      });
      it('emits the loggedOut event', (done) => {
        mockClient.emit = stub();
        const p = authenticationService.logout();
        p.then(() => {
          expect(mockClient.emit).to.be.calledOnceWith('authentication:loggedOut');
          done();
        });
      });
    });
    describe('when unsucessful', () => {
      it('propagates errors coming from the api', (done) => {
        const err = new Error('oops');
        mockApi.AuthenticationService.logout.rejects(err);
        authenticationService.logout()
          .then(() => {
            done('should have failed');
          })
          .catch((_err) => {
            expect(_err).to.equal(err);
            done();
          });
      });
    });
  });
});
