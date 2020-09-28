const explode = (words, head = []) => {
  if (typeof words === 'string') {
    words = words.split(':');
  }
  if (!words.length) {
    return [head.join(':')];
  }
  return []
    .concat(explode(words.slice(1), [].concat(head, words[0])))
    .concat(explode(words.slice(1), [].concat(head, '*')));
};

export default class Observable {
  #eventHandlers;
  constructor() {
    this.#eventHandlers = {};
  }

  emit(event, payload) {
    const parts = explode(event);
    const handlers = parts.reduce((handlers, ns) => {
      return handlers.concat(this.#eventHandlers[ns] || []);
    }, []);
    console.warn(this.constructor.name, `propagating event '${event}' to ${handlers.length} handler(s)`);
    handlers.forEach(h => h(payload, event));
  }

  on(event, handler) {
    this.#eventHandlers[event] = this.#eventHandlers[event] || [];
    this.#eventHandlers[event].push(handler);
  }

  unsubscribe(event, handler) {
    this.#eventHandlers[event] = (this.#eventHandlers[event] || [])
      .filter(h => {
        return h !== handler;
      });
  }

}
