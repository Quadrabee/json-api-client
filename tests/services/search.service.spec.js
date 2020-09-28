import { stub } from 'sinon';
import { expect } from 'chai';
import { SearchService } from '../../src/services';
import { Collection } from '../../src/jsonapi';

describe('the mock/SearchService service', () => {
  let mockApi, mockClient, mockCompaniesResult, mockSearchHistory;
  let searchService;
  beforeEach(() => {
    mockCompaniesResult = [];
    mockSearchHistory = [];
    mockApi = {
      EntitiesService: {
        searchCompanies: stub().resolves(mockCompaniesResult)
      },
      MyService: {
        searchHistory: stub().resolves(mockSearchHistory),
        pushToHistory: stub().resolves()
      }
    };
    mockClient = {
      api: mockApi
    };
    searchService = new SearchService({ client: mockClient });
  });

  describe('#searchCompanies', () => {
    describe('when called with search query', () => {
      it('returns a loading Collection object', () => {
        const c = searchService.searchCompanies({ attributes: { q: 'foo bar' } });
        expect(c).to.be.an.instanceOf(Collection);
        expect(c.loading).to.eql(true);
      });

      it('calls the SearchService/searchCompany API with query when present', (done) => {
        const c = searchService.searchCompanies({ attributes: { q: 'foo bar' } });
        c.promise.then(() => {
          expect(mockApi.EntitiesService.searchCompanies)
            .to.have.been.calledOnceWith({ q: 'foo bar', country: undefined, group: undefined, 'page[size]': 15 });
          done();
        }).catch(done);
      });
    });

    describe('when called without search query', () => {
      it('returns a non-loading Collection object', () => {
        const c = searchService.searchCompanies();
        expect(c).to.be.an.instanceOf(Collection);
        expect(c.loading).to.eql(false);
      });
    });
  });

  describe('#getSearchHistory', () => {
    it('returns a loading Collection object', () => {
      const c = searchService.getSearchHistory();
      expect(c).to.be.an.instanceOf(Collection);
      expect(c.loading).to.eql(true);
    });

    it('calls the MyService/searchHistory api', (done) => {
      const c = searchService.getSearchHistory();
      c.promise.then(() => {
        expect(mockApi.MyService.searchHistory).to.have.been.calledOnceWith();
        done();
      }).catch(done);
    });
  });

  describe('#pushSearchHistory', () => {
    it('returns a promise', () => {
      const p = searchService.pushSearchHistory({ document: { data: 'foobar' } });
      expect(p).to.be.an.instanceOf(Promise);
    });

    it('calls the MyService/pushToHistory api', (done) => {
      const p = searchService.pushSearchHistory({ document: { data: 'foobar' } });
      p.then(() => {
        expect(mockApi.MyService.pushToHistory).to.have.been.calledOnceWith('foobar');
        done();
      }).catch(done);
    });
  });
});
