import { expect } from 'chai';
import { Entity, Collection } from '../../src/jsonapi';

describe('Collection', () => {

  const documentByUri = {
    '/an/uri/': {
      data: [
        {
          id: 'an-id',
          type: 'AType',
          attributes: {
            name: 'A name'
          },
          links: {
            'self': '/a/specific/uri'
          }
        },
        {
          id: 'a-second-id',
          type: 'AType',
          attributes: {
            name: 'A second name'
          }
        }
      ],
      links: {
        self: '/an/uri/'
      }
    },
    '/a/specific/uri': {
      data: {
        attributes: {
          detailed: 'foo'
        }
      }
    },
    '/v1/next/uri/': {
      data: [
        {
          id: 'next-id',
          type: 'AType',
          attributes: {
            name: 'Third'
          }
        }
      ],
      links: {
        self: '/v1/next/uri/',
        next: '/v1/nextnext/uri/'
      }
    },
    '/v1/prev/uri/': {
      data: [
        {
          id: 'prev-id',
          type: 'AType',
          attributes: {
            name: 'prev'
          }
        }
      ],
      links: {
        self: '/v1/prev/uri/'
      }
    },
    '/v1/first/uri/': {
      data: [
        {
          id: 'first-id',
          type: 'AType',
          attributes: {
            name: 'First'
          }
        }
      ],
      links: {
        self: '/v1/first/uri/'
      }
    },
    '/v1/last/uri/': {
      data: [
        {
          id: 'last-id',
          type: 'AType',
          attributes: {
            name: 'Last'
          }
        }
      ],
      links: {
        self: '/v1/last/uri/'
      }
    },
    '/v1/nextnext/uri/': {
      data: [
        {
          id: 'nextnext-id',
          type: 'AType',
          attributes: {
            name: 'Next of next'
          }
        }
      ],
      links: {
        self: '/v1/nextnext/uri/'
      }
    },
    'an/uri/?q=enspirit&name=test&type=Company&page[number]=0': {
      data: [
        {
          id: 'an-id',
          type: 'Company',
          attributes: {
            name: 'test'
          }
        }
      ],
      links: {
        self: 'an/uri/?q=enspirit&name=test&type=Company&page[number]=0'
      }
    }
  };

  let collectionJson;

  const withLinks = (data, linkKind) => {
    const links = {
      self: data.links.self
    };
    links[linkKind] = `/v1/${linkKind}/uri/`;
    return Object.assign({}, data, {
      links: links
    });
  };

  const rebindableLoader = (data) => {
    const loader = (params) => {
      return new Promise((resolve, reject) => {
        resolve(data);
      });
    };
    loader.rebind = (uri) => {
      return rebindableLoader(documentByUri[uri]);
    };
    return loader;
  };

  beforeEach(() => {
    collectionJson = documentByUri['/an/uri/'];
  });

  describe('when used without a loader', () => {

    it('works as expected', () => {
      const c = new Collection(collectionJson);
      expect(c.links.self).to.eq('/an/uri/');
      expect(c.items.length).to.eq(2);
      expect(c.items[0].constructor).to.eq(Entity);
      expect(c.items[0].id).to.eq('an-id');
      expect(c.items[0].links.self).to.eq('/a/specific/uri');
      expect(c.items[0].attributes.name).to.eq('A name');
    });

    it('provides autolinking if children have no link', () => {
      const c = new Collection(collectionJson);
      expect(c.items[1].links.self).to.eq('/an/uri/a-second-id');
    });

    it('caches the items computation', () => {
      const c = new Collection(collectionJson);
      // @blambeau ??
      /* eslint-disable-next-line */
      expect(c.items === c.items).to.eq(true);
    });
  });

  describe('when used with a loader', () => {
    const loader = (params) => {
      return new Promise((resolve, reject) => {
        resolve(collectionJson);
      });
    };

    it('works as expected', async () => {
      const c = new Collection(loader);
      await c.load({});
      expect(c.loading).to.eq(false);
      expect(c.loaded).to.eq(true);
      expect(c.errored).to.eq(false);
      expect(c.error).to.eq(undefined);
      expect(c.items[0].id).to.eq('an-id');
      expect(c.items[1].id).to.eq('a-second-id');
    });

    it('cleans the items cache when reloading', async () => {
      const c = new Collection(loader);
      await c.load({});
      const itemsBefore = c.items;
      await c.load({});
      const itemsAfter = c.items;
      expect(itemsBefore === itemsAfter).to.eq(false);
    });
  });

  describe('#rebindWithArguments', () => {

    it('works as expected', async () => {
      const filter = { name: 'test', type: 'Company' };
      const json = {
        data : [{
          type: 'Company'
        }],
        links: {
          self: 'an/uri/?q=enspirit'
        }
      };
      const c = new Collection(rebindableLoader(json));
      c.rebindWithArguments(filter).then(l => {
        expect(l.constructor).to.eq(Collection);
        expect(l === c).to.eq(true);
        l.ensure().then((l2) => {
          expect(l2.data[0].id).to.eq('an-id');
          expect(l2.data[0].type).to.eq('Company');
          expect(l2.links.self).to.eq('an/uri/?q=enspirit&name=test&type=Company&page[number]=0');
        });
      });
    });
  });

  describe('when used with a rebindable loader', () => {

    it('works as expected', async () => {
      const c = new Collection(rebindableLoader(collectionJson));
      await c.load({});
      const i = c.items[0];
      await i.load();
      expect(i.attributes.detailed).to.eq('foo');
    });
  });

  describe('#hasPagination', () => {

    it('return true when the collection has the first link and meta', async () => {
      const j = {
        data: [{
          type: 'Company'
        }],
        links: {
          self: 'an/uri',
          first: 'first/uri'
        },
        meta: {
          pageSize: 12
        }
      };
      const c = new Collection(rebindableLoader(j));
      await c.load({});
      expect(c.hasPagination()).to.eq(true);
    });

    it('return false when the collection has only the next link', async () => {
      const j = {
        data: [{
          type: 'Company'
        }],
        links: {
          self: 'an/uri',
          next: 'next/uri'
        }
      };
      const c = new Collection(rebindableLoader(j));
      await c.load({});
      expect(c.hasPagination()).to.eq(false);
    });

    it('return false when the collection has only the meta', async () => {
      const j = {
        data: [{
          type: 'Company'
        }],
        links: {
          self: 'an/uri'
        },
        meta: {
          pageSize: 12
        }
      };
      const c = new Collection(rebindableLoader(j));
      await c.load({});
      expect(c.hasPagination()).to.eq(false);
    });
  });

  ['next', 'prev', 'first', 'last'].forEach((meth) => {
    describe('#' + meth, () => {

      it(`returns an error when the collection has no '${meth}' link`, (done) => {
        const c = new Collection(rebindableLoader(collectionJson));
        c[meth]().then((c2) => {
          expect(false).to.eq(true);
          done();
        }).catch((err) => {
          expect(err.message).to.eq(`Collection has no ${meth} link`);
          done();
        });
      });

      it('returns an error when used without a rebindable loader', (done) => {
        const c = new Collection(withLinks(collectionJson, meth));
        c[meth]().then((c2) => {
          expect(false).to.eq(true);
          done();
        }).catch((err) => {
          expect(err.message).to.eq('No loader set on /an/uri/');
          done();
        });
      });

      it(`returns a new collection when the collection has ${meth} link`, (done) => {
        const c = new Collection(rebindableLoader(withLinks(collectionJson, meth)));
        c[meth]().then(l => {
          expect(l.constructor).to.eq(Collection);
          expect(l === c).to.eq(true);
          l.ensure().then((l2) => {
            expect(l2.data[0].id).to.eq(`${meth}-id`);
            expect(l2.links.self).to.eq(`/v1/${meth}/uri/`);
          }).then(done).catch(done);
        }).catch(done);
      });

    });
  });

  describe('#loadMore()', () => {

    it('returns an error when the collection has no next link', (done) => {
      const c = new Collection(rebindableLoader(collectionJson));
      c.loadMore().then((c2) => {
        expect(false).to.eq(true);
        done();
      }).catch((err) => {
        expect(err.message).to.eq('Collection has no next link');
        done();
      });
    });

    it('returns an error when used without a rebindable loader', (done) => {
      const c = new Collection(withLinks(collectionJson, 'next'));
      c.loadMore().then((c2) => {
        expect(false).to.eq(true);
        done();
      }).catch((err) => {
        expect(err.message).to.eq('No loader set on /an/uri/');
        done();
      });
    });

    it('returns the collection with additional data loaded', (done) => {
      const c = new Collection(rebindableLoader(withLinks(collectionJson, 'next')));
      c.loadMore().then(l => {
        expect(l.constructor).to.eq(Collection);
        expect(l === c).to.eql(true);
        expect(l.data.length).to.eq(3);
        expect(l.data[0].id).to.eq('an-id');
        expect(l.data[1].id).to.eq('a-second-id');
        expect(l.data[2].id).to.eq('next-id');
        done();
      }).catch(done);
    });

    it('can be used twice in a row', (done) => {
      const c = new Collection(rebindableLoader(withLinks(collectionJson, 'next')));
      c.loadMore().then(l => {
        expect(l.constructor).to.eq(Collection);
        expect(l === c).to.eql(true);
        expect(l.data.length).to.eq(3);
        return l.loadMore().then(l2 => {
          expect(l2.data.length).to.eq(4);
          expect(l2.data[2].id).to.eq('next-id');
          expect(l2.data[3].id).to.eq('nextnext-id');
          done();
        });
      }).catch(done);
    });
  });
});
