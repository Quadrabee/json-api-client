import { Entity } from '../jsonapi';

const Entities = {
};

for (const [name, clazz] of Object.entries(Entities)) {
  Entity.registerType(name, clazz);
}

export {
};
