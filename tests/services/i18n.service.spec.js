import { stub } from 'sinon';
import { expect } from 'chai';
import { I18NService } from '../../src/services';
import { TranslationGroup, I18NStaticSource } from '../../src/i18n';

describe('the I18NService', () => {
  let service, mockClient;
  beforeEach(() => {
    mockClient = {};
    service = new I18NService({ client: mockClient });
  });

  describe('the setter for locale', () => {
    let source1, source2;
    beforeEach(() => {
      source1 = new I18NStaticSource({});
      source2 = new I18NStaticSource({});
      source1.load = stub().resolves({ foo: 'bar' });
      source2.load = stub().resolves({ name: 'alfred' });
      service.addSource(source1);
      service.addSource(source2);
    });

    it('changes the locale value', () => {
      service.locale = 'fr-BE';
      expect(service.locale).to.equal('fr-BE');
    });

    it('loads all sources', () => {
      service.locale = 'fr-BE';
      expect(source1.load).to.be.calledOnceWith('fr-BE');
      expect(source2.load).to.be.calledOnceWith('fr-BE');
    });
  });

  describe('#addGroup', () => {
    it('expects TranslationGroup as argument', () => {
      const test = () => service.addGroup('foo');
      expect(test).to.throw(/TranslationGroup expected/);
    });

    it('exposes the TranslationGroup in the list of groups', () => {
      const tsg = new TranslationGroup({
        namespace: 'ns',
        defaults: {}
      });
      service.addGroup(tsg);
      expect(service.groups.ns).to.equal(tsg);
    });

    it('splits dotted namespaces into a group hierarchy', () => {
      const tsg = new TranslationGroup({
        namespace: 'components.search.MySearchComponent',
        defaults: {}
      });
      service.addGroup(tsg);
      expect(service.groups.components.search.MySearchComponent).to.equal(tsg);
    });

    it('support multiple groups sharing part of the hierarchy', () => {
      const tsg1 = new TranslationGroup({
        namespace: 'components.search.SearchBar',
        defaults: {}
      });
      const tsg2 = new TranslationGroup({
        namespace: 'components.search.AutoCompleteInput',
        defaults: {}
      });
      const tsg3 = new TranslationGroup({
        namespace: 'components.LoginForm',
        defaults: {}
      });
      service.addGroup(tsg1);
      service.addGroup(tsg2);
      service.addGroup(tsg3);
      expect(service.groups.components.search.SearchBar).to.equal(tsg1);
      expect(service.groups.components.search.AutoCompleteInput).to.equal(tsg2);
      expect(service.groups.components.LoginForm).to.equal(tsg3);
    });

    it('raises errors in the case of duplicated namespaces', () => {
      service.addGroup(new TranslationGroup({
        namespace: 'components.search.SearchBar',
        defaults: {}
      }));
      const test = () => service.addGroup(new TranslationGroup({
        namespace: 'components.search',
        defaults: {}
      }));
      expect(test).to.throw(/Cannot override existing group/);
    });
  });
});
