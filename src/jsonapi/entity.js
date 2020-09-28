import _ from 'lodash';
import Resource from './resource';
import Relationships from './relationships';
import EntityProxy from './entity-proxy';

const EntityTypes = {};

/**
 * Concrete version of Resource for so called jsonapi Objects (vs. Collections
 * of them).
 *
 * This class adds a few shortcuts & methods to the Resource contract.
 */
export default class Entity extends Resource {

  /*
   * Returns the entity id (i.e. json's data.id field).
   */
  get id() {
    return this.data && this.data.id;
  }

  /*
   * Returns the entity type (i.e. json's data.type field).
   */
  get type() {
    return this.data && this.data.type;
  }

  /*
   * Returns the entity attributes (i.e. json's data.attributes field).
   */
  get attributes() {
    return this.data && this.data.attributes;
  }

  get relationships() {
    if (!this._relationships) {
      this._relationships = new Relationships(this);
    }
    return this._relationships;
  }

  ensureRelationships(filters) {
    return (this.promise || Promise.resolve(this))
      .then(() => {
        const promises = _(filters)
          .map((mustLoad, r) => {
            const relationship = this.relationships[r];
            if (mustLoad) {
              if (relationship.loaded) {
                return Promise.resolve(relationship);
              }
              return relationship.load()
                .then(() => relationship);
            }
          })
          .compact()
          .value();
        return Promise.all(promises);
      });
  }

  /**
   * Fork this entity and returns a new instance with some attributes overriden.
   */
  withAttributes(attrs) {
    const newDoc = _.cloneDeep(this.document);
    newDoc.data.attributes = Object.assign({}, newDoc.data.attributes, attrs);
    return Entity.factor(newDoc, this.loader);
  }

  dress(itemDoc, subEntities = {}) {
    const doDress = (data, clazz) => {
      const selfLink = data.links && data.links.self;
      const loader = selfLink ? this.rebindLoader(selfLink, false) : null;
      return Entity.factor({ data: data }, loader, clazz);
    };
    const dressSubEntity = (data, path, clazz) => {
      const entityData = _.get(data, path);
      if (entityData && _.isArray(entityData)) {
        const entities = entityData.map((data) => {
          return doDress(data, clazz);
        });
        _.set(data, path, entities);

      } else if (entityData) {
        const entity = doDress(entityData, clazz);
        _.set(data, path, entity);
      }
    };
    const cloneDoc = itemDoc ? Object.assign({}, itemDoc) : itemDoc;
    if (cloneDoc) {
      _.each(subEntities, (clazz, path) => {
        dressSubEntity(cloneDoc.data, path, clazz);
      });
    }
    return cloneDoc;
  }

  static factor(itemDoc, itemLoader, typeNameOrClass) {
    if (_.isFunction(itemDoc)) {
      itemLoader = itemDoc;
      itemDoc = undefined;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (_.isString(itemLoader) || Entity.isPrototypeOf(itemLoader)) {
      typeNameOrClass = itemLoader;
      itemLoader = null;
    }
    let clazz = typeNameOrClass;
    if (_.isString(typeNameOrClass)) {
      clazz = EntityTypes[typeNameOrClass];
    }
    if (!clazz) {
      clazz = this;
    }
    const entity = new clazz(itemDoc, itemLoader);
    return EntityProxy.create(entity);
  }

  static registerType(typeName, clazz) {
    EntityTypes[typeName] = clazz;
  }
}
