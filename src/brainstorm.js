import { Api } from './api';

const FlairApi = new Api({
  baseUrl: '/api'
});

const TokenInterceptor = FlairApi.factorInterceptor('TokenInterceptor', {
  enabled: true,
  onBeforeRequest(req, next) {

  },
  onAfterRequest(req, next) {

  }
});

const TokenInjector = FlairApi.factorInterceptor('TokenInjector', {
  enabled: true,
  onBeforeRequest(req, next) {

  },
  onAfterRequest(req, next) {

  }
});

const EntitiesService = FlairApi.addService('EntitiesService', {
  path: '/entities',
  interceptors: (interceptors) => ([
    TokenInjector,
    TokenInterceptor
    // ability to change the collection of enabled interceptors
    // contract: return collection of interceptors
  ])
});

EntitiesService.addEndpoint('getCompanies', {
  method: 'GET',
  path: '/companies'
}); 
EntitiesService.addEndpoint('getCompanyById', {
  method: 'GET',
  path: '/companies/:id'
});
EntitiesService.addEndpoint('getPeople', {
  method: 'GET',
  path: '/people'
});
EntitiesService.addEndpoint('getPersonById', {
  method: 'GET',
  path: '/people/:id'
});

const AuthenticationService = FlairApi.addService('EntitiesService', {
  path: '/auth'
});

AuthenticationService.addEndpoint('authenticate', {
  method: 'POST',
  path: '/tokens/',
  interceptors: (interceptors) => {
    interceptors.remove('TokenInjector');
    return interceptors;
  }
});
