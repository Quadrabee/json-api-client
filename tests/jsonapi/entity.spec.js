import { expect } from 'chai';
import { Entity, Collection, Relationships } from '../../src/jsonapi';

class SubEntityClass extends Entity {
}

Entity.registerType('SubEntityClass', SubEntityClass);

describe('Entity', () => {
  const entityJson = {
    data: {
      id: 'an-id',
      type: 'AType',
      attributes: {
        name: 'A name'
      },
      relationships: {
        author: {
          data: {
            id: 'hello',
            type: 'Entity'
          },
          links: {
            self: '/an/uri/hello'
          }
        },
        articles: {
          data: {
            type: 'Collection'
          },
          links: {
            self: '/an/uri/articles/'
          }
        }
      }
    },
    links: {
      self: '/an/uri'
    }
  };

  const relatedEntityJson = {
    data: {
      id: 'hello',
      type: 'RelatedEntity'
    },
    links: {
      self: '/an/uri/hello'
    }
  };

  const relatedCollectionJson = {
    data: [{
      id: '1',
      type: 'ArticleEntity',
      links: {
        self: '/an/uri/articles/1'
      }
    }],
    links: {
      self: '/an/uri/articles/'
    }
  };

  const aLoader = () => {
    const loader = (params) => {
      return new Promise((resolve, reject) => {
        setTimeout(function() {
          loader.called += 1;
          resolve(entityJson);
        }, 10);
      });
    };
    loader.called = 0;
    loader.rebind = (uri) => {
      return (params) => {
        return new Promise((resolve, reject) => {
          if (uri === '/an/uri/hello') {
            resolve(relatedEntityJson);
          } else if (uri === '/an/uri/articles/') {
            resolve(relatedCollectionJson);
          }
        });
      };
    };
    return loader;
  };

  describe('#factor', () => {
    it('returns a proxied entity instance', () => {
      const entity = Entity.factor({});
      expect(entity.isProxiedEntity).to.eql(true);
    });
    it('allows you to specify the subtype (string)', () => {
      const entity = Entity.factor({}, 'SubEntityClass');
      expect(entity.isProxiedEntity).to.eql(true);
      expect(entity).to.an.instanceOf(Entity);
      expect(entity).to.an.instanceOf(SubEntityClass);
    });
    it('allows you to specify the subtype (class)', () => {
      const entity = Entity.factor({}, SubEntityClass);
      expect(entity.isProxiedEntity).to.eql(true);
      expect(entity).to.an.instanceOf(Entity);
      expect(entity).to.an.instanceOf(SubEntityClass);
    });
    it('allows you to specify only the loader', () => {
      const loader = () => {};
      const entity = Entity.factor(loader);
      expect(entity.isProxiedEntity).to.eql(true);
      expect(entity).to.an.instanceOf(Entity);
      expect(entity.loader).to.eql(loader);
    });
    it('allows you to specify the doc and loader', () => {
      const loader = () => {};
      const entity = Entity.factor({}, loader);
      expect(entity.isProxiedEntity).to.eql(true);
      expect(entity).to.an.instanceOf(Entity);
      expect(entity.loader).to.eql(loader);
    });
    it('allows you to specify the doc, loader and type (string)', () => {
      const loader = () => {};
      const entity = Entity.factor({}, loader, 'SubEntityClass');
      expect(entity.isProxiedEntity).to.eql(true);
      expect(entity).to.an.instanceOf(Entity);
      expect(entity).to.an.instanceOf(SubEntityClass);
      expect(entity.loader).to.eql(loader);
    });
    it('allows you to specify the doc, loader and type (class)', () => {
      const loader = () => {};
      const entity = Entity.factor({}, loader, SubEntityClass);
      expect(entity.isProxiedEntity).to.eql(true);
      expect(entity).to.an.instanceOf(Entity);
      expect(entity).to.an.instanceOf(SubEntityClass);
      expect(entity.loader).to.eql(loader);
    });
    it('supports subclassing', () => {
      const e = Entity.factor({});
      expect(e).instanceOf(Entity);
      class Subclass extends Entity {}
      const s = Subclass.factor({});
      expect(s).instanceOf(Subclass);
    });
    it('dresses Entity subclasses properly', () => {
      class SubEntity extends Entity {}
      class ParentEntity extends Entity {
        dress(itemDoc) {
          return super.dress(itemDoc, {
            'attributes.subentity': SubEntity
          });
        }
      }
      const entity = Entity.factor({
        data: {
          attributes: {
            subentity: {
              attributes: {
                foo: 'bar'
              }
            }
          }
        }
      }, ParentEntity);
      expect(entity.subentity).to.be.an.instanceOf(SubEntity);
    });
  });

  describe('when used without a loader', () => {
    it('works as expected', () => {
      const e = new Entity(entityJson);
      expect(e.id).to.eq('an-id');
      expect(e.links.self).to.eql('/an/uri');
      expect(e.attributes.name).to.eql('A name');
    });

    it('has a ensure method that resolves to the entity', async () => {
      const e = new Entity(entityJson);
      const f = await e.ensure();
      expect(e === f).to.eql(true);
    });
  });

  describe('when used with a loader', () => {

    it('works as expected', async () => {
      const loader = aLoader();
      const e = new Entity(loader);
      const f = await e.load({});
      expect(e === f).to.eq(true);
      expect(e.loading).to.eq(false);
      expect(e.loaded).to.eq(true);
      expect(e.errored).to.eq(false);
      expect(e.error).to.eq(undefined);
      expect(e.id).to.eq('an-id');
      expect(e.links.self).to.eql('/an/uri');
      expect(e.attributes.name).to.eql('A name');
    });

    it('has an ensure method that forces loading the first time', async () => {
      const loader = aLoader();
      const e = new Entity(loader);
      expect(e.loaded).to.eql(false);
      const f = await e.ensure();
      expect(e === f).to.eql(true);
      expect(f.loaded).to.eql(true);
    });

    it('has an ensure method that reused previously loaded data the second time', async () => {
      const loader = aLoader();
      const e = new Entity(loader);
      expect(loader.called).to.eql(0);
      expect(e.loaded).to.eq(false);
      const f = await e.load({});
      expect(loader.called).to.eql(1);
      expect(f.loaded).to.eq(true);
      const g = await f.ensure();
      expect(loader.called).to.eql(1);
      expect(g === f).to.eql(true);
      expect(g.loaded).to.eql(true);
    });

    it('helps with entity relationships', async () => {
      const loader = aLoader();
      const e = new Entity(loader);
      await e.load({});
      expect(e.relationships.constructor).to.eq(Relationships);
      //
      expect(e.relationships.author.constructor).to.eq(Entity);
      await e.relationships.author.load({});
      expect(e.relationships.author.links).to.eql({ self: '/an/uri/hello' });
      //
      expect(e.relationships.articles.constructor).to.eq(Collection);
      await e.relationships.articles.load({});
      expect(e.relationships.articles.links).to.eql({ self: '/an/uri/articles/' });
    });

    it('helps ensuring entity relationships are loaded 1/3', async () => {
      const loader = aLoader();
      const e = new Entity(loader);
      e.load();
      await e.ensureRelationships({ author: true, articles: false });

      expect(e.relationships.constructor).to.eq(Relationships);
      //
      expect(e.relationships.author.constructor).to.eq(Entity);
      expect(e.relationships.author.links).to.eql({ self: '/an/uri/hello' });
      //
      expect(e.relationships.articles.constructor).to.eq(Collection);
      expect(e.relationships.articles.links).to.eql(undefined);
    });

    it('helps ensuring entity relationships are loaded 2/3', async () => {
      const loader = aLoader();
      const e = new Entity(loader);
      // Load the entity first
      await e.load();
      // To ensure promises are resolved properly
      await e.ensureRelationships({ author: true, articles: false });
      expect(e.relationships.constructor).to.eq(Relationships);
      //
      expect(e.relationships.author.constructor).to.eq(Entity);
      expect(e.relationships.author.links).to.eql({ self: '/an/uri/hello' });
      //
      expect(e.relationships.articles.constructor).to.eq(Collection);
      expect(e.relationships.articles.links).to.eql(undefined);
    });

    it('helps ensuring entity relationships are loaded 3/3', async () => {
      const loader = aLoader();
      const e = new Entity(loader);
      await e.load({});
      await e.relationships.author.load({});
      await e.relationships.articles.load({});

      // Decorate articles and author to ensure they are untouched
      e.relationships.author.document.data.untouched = true;
      e.relationships.articles.document.data.untouched = true;

      await e.ensureRelationships({ author: true, articles: true });

      expect(e.relationships.articles.document.data.untouched).to.eql(true);
      expect(e.relationships.author.document.data.untouched).to.eql(true);
    });

    it('returns a catchable promise by default', async () => {
      const loader = (params) => {
        return new Promise((resolve, reject) => {
          throw new Error('An error occured');
        });
      };
      const e = new Entity(loader);
      let seen = false;
      const f = await e.load({}).catch((ex) => {
        seen = true;
        expect(ex.message).to.eq('An error occured');
      });
      expect(f).to.eq(undefined);
      expect(seen).to.eq(true);
      expect(e.loaded).to.eq(false);
      expect(e.loading).to.eq(false);
      expect(e.errored).to.eq(false);
      expect(e.error).to.eq(undefined);
    });

    it('lets hide errors and keep internal state instead', async () => {
      const loader = (params) => {
        return new Promise((resolve, reject) => {
          throw new Error('An error occured');
        });
      };
      const e = new Entity(loader);
      let seen = false;
      const f = await e.load({}, true).catch((ex) => {
        seen = true;
      });
      expect(f === e).to.eq(true);
      expect(seen).to.eq(false);
      expect(e.loaded).to.eq(true);
      expect(e.loading).to.eq(false);
      expect(e.errored).to.eq(true);
      expect(e.error.message).to.eq('An error occured');
    });
  });
});
