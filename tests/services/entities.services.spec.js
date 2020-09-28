import { stub } from 'sinon';
import { expect } from 'chai';
import { EntitiesService } from '../../src/services';
import { Entity } from '../../src/jsonapi';

describe('the mock/EntitiesService service', () => {
  let mockApi, mockClient, mockCompanyResult;
  let entitiesService;
  beforeEach(() => {
    mockCompanyResult = {
      data: {
        attributes: {
          type: 'Company',
          id: '12',
          identifiers: [
            { name: 'europeanVAT', value: 'BE016787', lastUpdate: null },
            { name: 'siren', value: 'BE526866', lastUpdate: null }
          ],
          activity: [
            { name: 'nace2Code', value: '6201', isPrimary: false },
            { name: 'nace2Code', value: '1411', isPrimary: true }
          ]
        }
      }
    };
    mockApi = {
      EntitiesService: {
        getCompany: stub().resolves(mockCompanyResult)
      }
    };
    mockClient = {
      api: mockApi
    };
    entitiesService = new EntitiesService({ client: mockClient });
  });

  describe('#getCompanyById', () => {
    describe('when called with an id', () => {
      it('returns a loading Entity object', () => {
        const c = entitiesService.getCompanyById({ id: 12 });
        expect(c).to.be.an.instanceOf(Entity);
        expect(c.loading).to.eql(true);
      });

      it('calls the EntitiesService/getCompany api', (done) => {
        const c = entitiesService.getCompanyById({ id: 12 });
        c.promise.then((r) => {
          expect(mockApi.EntitiesService.getCompany).to.have.been.calledOnceWith();
          done();
        }).catch(done);
      });
    });
  });
});
