import Resource from './resource';
import Entity from './entity';
import { ApiUtils } from '../api';

/**
 * Concrete version of Resource for so called jsonapi Collections of Objects.
 *
 * This class adds a few shortcuts & methods to the Resource contract.
 */
export default class Collection extends Resource {

  /**
   * Returns the collection items dressed as Entity instances.
   *
   * The result of this method is put in cache, so the caller is guaranteed
   * to get the same items every time until the next reload.
   */
  get items() {
    if (this.__cache.items) return this.__cache.items;
    if (this.document && this.document.data) {
      this.__cache.items = this.document.data.map((d) => {
        const links = d.links ? d.links : {};
        if (!links.self && this.links && this.links.self) {
          links.self = ApiUtils.concat(this.links.self, d.id);
        }
        const itemDoc = {
          data: d,
          links: links
        };
        const itemLoader = this.rebindLoader(itemDoc.links.self);
        return Entity.factor(itemDoc, itemLoader, d.type);
      });
    } else {
      this.__cache.items = [];
    }
    return this.__cache.items;
  }

  sortBy(sortsList) {
    this.rebindWithArguments({ sort: sortsList.toString() });
  }

  hasPagination() {
    return !!(this.links && (this.links.first || this.links.last) && this.meta);
  }

  rebindWithArguments(args) {
    return this.ensure().then((c) => {
      const link = ApiUtils.replaceParams(c.links.self, args);
      c.loader = this.rebindLoader(link);
      return c.load({});
    });
  }

  rebindToLink(kind) {
    return this.ensure().then((c) => {
      const link = c.links[kind];
      if (!link) {
        throw new Error(`Collection has no ${kind} link`);
      }
      c.loader = this.rebindLoader(link);
      return c.load({});
    });
  }

  next() {
    return this.rebindToLink('next');
  }

  prev() {
    return this.rebindToLink('prev');
  }

  first() {
    return this.rebindToLink('first');
  }

  last() {
    return this.rebindToLink('last');
  }

  loadMore() {
    return this.ensure().then(c => {
      const link = c.links.next;
      if (!link) {
        throw new Error('Collection has no next link');
      }
      c.loader = this.rebindLoader(link);
      return c.load({}, false, (res) => {
        return Object.assign({}, this.document, {
          data: this.document.data.concat(res.data),
          links: res.links
        });
      });
    });
  }
}
