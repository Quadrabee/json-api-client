import _ from 'lodash';
import { expect } from 'chai';
import EntityProxy from '../../src/jsonapi/entity-proxy';

describe('EntityProxy', () => {

  class Entity {
    constructor(props) {
      _.reduce(props, (that, v, k) => {
        that[k] = v;
        return that;
      }, this);
    }
  }

  let object, proxy;
  beforeEach(() => {
    object = new Entity({
      id: 42,
      type: 'Person.Full',
      meta: {
        version: 33
      },
      attributes: {
        meta: {
          version: 44
        },
        name: 'John',
        lastname: 'Doe',
        preferences: {
          foo: 'bar',
          presence: {
            country: 'BE'
          }
        }
      }
    });
    proxy = EntityProxy.create(object);
  });

  describe('constructor', () => {
    it('throws errors to document on proper usage', () => {
      expect(() => new EntityProxy()).to.throw(/EntityProxy not meant to be instantiated/);
    });
  });

  describe('the special decorators', () => {
    it('contain isProxiedEntity, with value true', () => {
      expect(proxy.isProxiedEntity).to.eql(true);
    });
    it('contain ._proxiedEntity, with the original instance', () => {
      expect(proxy._proxiedEntity).to.eql(object);
    });
  });

  describe('accessing properties (getters)', () => {

    it('mimics the class inheritance of the original object', () => {
      expect(object).to.be.an.instanceOf(Entity);
    });

    it('proxies to the object for special field `id`', () => {
      expect(proxy.id).to.eql(42);
      expect(proxy.missing).to.eql(undefined);
    });

    it('allows access to the attributes property as a normal object', () => {
      expect(proxy.attributes).to.be.an('object');
      expect(proxy.attributes.name).to.eql('John');
      expect(proxy.attributes.missing).to.eql(undefined);
    });

    it('looks for missing props in attributes', () => {
      expect(proxy.name).to.eql('John');
      expect(proxy.lastname).to.eql('Doe');
    });

    it('attributes properties do shadow entity properties', () => {
      expect(proxy.meta).to.be.an('object');
      expect(proxy.meta.version).to.eql(44);
    });

    it('is compatible with tools such as _.get', () => {
      expect(_.get(proxy, 'name')).to.eql('John');
      expect(_.get(proxy, 'preferences.foo')).to.eql('bar');
      expect(_.get(proxy, 'preferences.presence.country')).to.eql('BE');
    });
  });

  describe('accessing properties (setters)', () => {
    it('allows us to erase an existing property', () => {
      proxy.id = 'foobar';
      expect(object.id).to.equal('foobar');
    });
    it('allows us to erase an existing attribute', () => {
      proxy.name = 'foobar';
      expect(object.attributes.name).to.equal('foobar');
    });
    it('allows us to create new properties', () => {
      proxy.missing = 'foobar';
      expect(object.missing).to.equal('foobar');
    });
    it('does not allow us to create new attributes', () => {
      proxy.missing = 'foobar';
      expect(object.attributes.missing).to.not.equal('foobar');
    });
  });

  describe('accessing properties (delete)', () => {
    it('throws an error, entities are immutable', () => {
      expect(() => delete proxy.id).to.throw(/Entities are immutable.*trying to delete/);
      expect(() => delete proxy.name).to.throw(/Entities are immutable.*trying to delete/);
    });
  });

  describe('accessing properties with falsy values', () => {
    it ('proxies properly null values', () => {
      const e = EntityProxy.create({ attributes: { value: null } });
      expect(e.value).to.eql(null);
    });
    it ('proxies properly 0 values', () => {
      const e = EntityProxy.create({ attributes: { value: 0 } });
      expect(e.value).to.eql(0);
    });
    it ('proxies properly false values', () => {
      const e = EntityProxy.create({ attributes: { value: false } });
      expect(e.value).to.eql(false);
    });
  });

  describe('interrogating properties (in)', () => {
    it('returns true for entity properties', () => {
      expect('id' in proxy).to.eql(true);
      expect('meta' in proxy).to.eql(true);
      expect('missing' in proxy).to.eql(false);
    });
    it('returns true for existing attributes', () => {
      expect('name' in proxy).to.eql(true);
      expect('lastname' in proxy).to.eql(true);
    });
  });

});
