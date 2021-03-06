import BaseElement from '../core/BaseElement';

class DiagramUI extends BaseElement {
  static get type() {
    return 'diagramUI';
  }

  constructor(target) {
    super();

    this._target = target || null;
    this._events = new Map();
    this._handleEvent = this._handleEvent.bind(this);
  }

  _handleEvent(event) {
    const { target, type } = event;
    const eventMap = this._events.get(type);
    const listeners = eventMap.get(target);

    if (listeners) {
      event.stopPropagation();
      listeners.forEach((listener) => listener(event));
    }
  }

  _createEventMap(event) {
    let eventMap = this._events.get(event);

    if (!eventMap) {
      eventMap = new WeakMap();
      this._events.set(event, eventMap);
      this.getElement().addEventListener(event, this._handleEvent, false);
    }
  }

  _getListenersSet(event, svgElement) {
    this._createEventMap(event);

    const eventMap = this._events.get(event);
    let listenersSet = eventMap.get(svgElement);

    if (!listenersSet) {
      listenersSet = new Set();
      eventMap.set(svgElement, listenersSet);
    }

    return listenersSet;
  }

  addControl(svgElement, events) {
    if (events) {
      Object.entries(events).forEach(([event, listeners]) => {
        const listenersArray = Array.isArray(listeners) ? listeners.slice(0) : [listeners];
        const listenersSet = this._getListenersSet(event, svgElement);

        listenersArray.forEach((listener) => listenersSet.add(listener));
      });
    }

    this.getElement().appendChild(svgElement);
  }

  /**
   * By default this element is only visible on hovering on it's parent Shape. This method will
   * allow to make it permanently visible until it's called again with a 'false' parameter.
   * @param {Boolean} [active = true] If the layer will be permanently visible.
   */
  setActive(active = true) {
    const activeClass = 'active';

    if (active) {
      this._el.classList.add(activeClass);
    } else {
      this._el.classList.remove(activeClass);
    }
  }

  _createElement() {
    const layer = BaseElement.createSVG('g');

    layer.classList.add('ui-layer');
    this._el = layer;

    return super._createElement();
  }

  remove() {
    this._events.clear();
    super.remove();
  }
}

export default DiagramUI;
