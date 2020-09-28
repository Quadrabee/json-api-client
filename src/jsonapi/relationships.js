import Entity from './entity';
import Collection from './collection';

export default class Relationships {
  #entity;
  #cache;

  constructor(entity) {
    this.#entity = entity;
    this.#cache = {};
    Object.keys(entity.data.relationships || {}).forEach((rel) => {
      this.defineOne(rel);
    });
  }

  defineOne(rel) {
    Object.defineProperty(this, rel, {
      enumerable: true,
      get() {
        if (!this.#cache[rel]) {
          const envelope = this.#entity.data.relationships[rel];
          const loader = this.#entity.rebindLoader(envelope.links.self, true);
          if (envelope.data.type === 'Entity') {
            this.#cache[rel] = Entity.factor(undefined, loader);
          } else {
            this.#cache[rel] = new Collection(undefined, loader);
          }
        }
        return this.#cache[rel];
      }
    });
  }
}
