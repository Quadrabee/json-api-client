/**
 * Abstract class for JSON api Entity and Collection.
 *
 * A JsonApi Resource is a data object, following jsonapi.org conventions.
 * This class may be used in two modes:
 *
 * - In static mode, static data is passed at construction once for all.
 *   In such mode, instances are supposed to be used in an immutable way.
 *
 *       new Resource({ data: {}, links: {} })
 *
 * - In dynamic mode, a data loader is passed at construction, that
 *   returns a Promise resolving to the Resource data:
 *
 *       new Resource((args) => {
 *         return new Promise((res,ref) => { res({ data: {}, links: {} }) })
 *       })
 *
 *   In such mode, the `load` method can be used to eventually refresh internal
 *   data. In that sense, instances are mutable in practice. It is not expected
 *   to use that mutability in any other way, though. The dynamic mode supports
 *   the following flags & variables:
 *
 *     * loading: Boolean, whether a load process is currently ongoing.
 *     * loaded: Boolean, whether the entity has been loaded successfully.
 *     * errored: Boolean, whether the entity failed to load in silent mode.
 *     * error: Error, last load error seen.
 *
 * See also: Entity, Collection and the load method.
 */
export default class Resource {
  constructor(document, loader) {
    if (typeof document === 'function') {
      loader = document;
      document = undefined;
    }
    if (!document && !loader) {
      throw new Error('At least a document or a loader is needed');
    }
    this.loader = loader;
    this.promise = null;
    this.loaded = (document !== undefined);
    this.errored = false;
    this.document = this.dress(document);
    this.error = undefined;
    this.__cache = {};
  }

  /**
   * Reloads the entity using the loader passed at construction, and eventually
   * changes internal data to reflect it.
   *
   * This method returns a Promise, that resolves to the entity itself when
   * internal data reflects the reload. By default the returned promise is
   * catchable for manual error handling by the caller. In such case, the
   * original instance is kept unchanged.
   *
   * The `silent` parameter can be set to `true` to have a different error
   * handling behavior. When set to true, errors are hidden to the caller and
   * the entity set in a `errored` state.
   */
  load(args, silent = false, callback = (res) => res) {
    if (!this.loader) {
      throw new Error('No loader set on ' + (this.links && this.links.self));
    }
    this.loaded = false;
    this.errored = false;
    this.error = undefined;
    this.promise = this.loader(args)
      .then((res) => {
        this.__cache = {};
        const newDoc = callback(res);
        this.document = this.dress(newDoc);
        this.promise = null;
        this.loaded = true;
        this.errored = false;
        this.error = undefined;
        return this;
      }).catch((error) => {
        this.promise = null;
        if (silent) {
          this.loaded = true;
          this.errored = true;
          this.error = error;
          return this;
        } else {
          throw error;
        }
      });
    return this.promise;
  }

  ensure() {
    if (!this.loaded) {
      if (this.loader) {
        if (this.promise) {
          return this.promise;
        } else {
          return this.load();
        }
      } else {
        return Promise.resolve(this);
      }
    } else {
      return Promise.resolve(this);
    }
  }

  dress(doc) {
    return doc;
  }

  /**
   * Returns true when waiting on a promise to resolve
   */
  get loading() {
    return !!this.promise;
  }

  /**
   * Shortuct over document.data.
   */
  get data() {
    return this.document && this.document.data;
  }

  /**
   * Shortuct over document.links.
   */
  get links() {
    return this.document && this.document.links;
  }

  get meta() {
    return this.document && this.document.meta;
  }

  /**
   * Asks the loader to rebind itself to another URI, for use
   * to load a sub entity from its links.
   */
  rebindLoader(toUri, failOnError = false) {
    if (this.loader && this.loader.rebind) {
      const rebound = this.loader.rebind(toUri);
      if (!rebound && failOnError) {
        throw new Error('Rebound failed on ' + toUri);
      }
      return rebound;
    } else if (this.loader && failOnError) {
      throw new Error('Loader is not rebindable');
    } else if (failOnError) {
      throw new Error('No loader set, no rebind possible');
    }
  }
}
