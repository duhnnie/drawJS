import Element from '../core/Element';
import Component from '../component/Component';
import Port from '../connection/Port';
import Connection from '../connection/Connection';
import RegularDraggableShapeBehavior from '../behavior/RegularDraggableShapeBehavior';
import ConnectivityBehavior from '../behavior/ConnectivityBehavior';
import SelectBehavior from '../behavior/SelectBehavior';
import ResizeBehavior from '../behavior/ResizeBehavior';
import ShapeControlsLayer from './components/ShapeControlsLayer';

const DEFAULTS = {
  position: {
    x: 0,
    y: 0,
  },
};

class Shape extends Component {
  constructor(settings) {
    super(settings);
    this._width = null;
    this._height = null;
    this._x = null;
    this._y = null;
    this._connections = new Set();
    this._ports = [];
    this._controlsLayer = new ShapeControlsLayer();
    this._dragBehavior = new RegularDraggableShapeBehavior(this);
    this._connectivityBehavior = new ConnectivityBehavior(this);
    this._selectBehavior = new SelectBehavior(this);
    this._resizeBehavior = new ResizeBehavior(this);
    this.__bulkAction = false;

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    this._initPorts()
      .setPosition(settings.position.x, settings.position.y)
      .setSize(settings.width, settings.height);
  }

  _initPorts() {
    Object.values(Port.INDEX).forEach((portIndex) => {
      let direction = portIndex % 2 ? -1 : 1;

      if (portIndex < 2) {
        direction = portIndex % 2 || -1;
      }

      this._ports[portIndex] = new Port({
        shape: this,
        orientation: portIndex % 2 ? Port.ORIENTATION.X : Port.ORIENTATION.Y,
        direction,
      });
    });

    return this;
  }

  setX(x) {
    if (typeof x !== 'number') {
      throw new Error('setX(): invalid parameter.');
    }

    this._x = x;

    if (this._html) {
      this._html.setAttribute('transform', `translate(${x}, ${this._y})`);

      if (!this.__bulkAction) {
        this._drawConnections();
      }
    }

    return this;
  }

  getX() {
    return this._x;
  }

  setY(y) {
    if (typeof y !== 'number') {
      throw new Error('setY(): invalid parameter.');
    }
    this._y = y;

    if (this._html) {
      this._html.setAttribute('transform', `translate(${this._x}, ${y})`);

      if (!this.__bulkAction) {
        this._drawConnections();
      }
    }

    return this;
  }

  getY() {
    return this._y;
  }

  setPosition(x, y) {
    this.__bulkAction = true;

    this.setX(x)
      .setY(y);

    this.__bulkAction = false;

    return this._drawConnections();
  }

  getPosition() {
    return {
      x: this._x,
      y: this._y,
    };
  }

  setWidth(width) {
    if (typeof width !== 'number') {
      throw new Error('setWidth(): invalid parameter.');
    }

    const { mainElement } = this._dom;

    this._width = width;

    if (mainElement) {
      mainElement.setAttribute('width', width);
      mainElement.setAttribute('x', this._width * -0.5);
    }

    return this;
  }

  getWidth() {
    return this._width;
  }

  setHeight(height) {
    if (typeof height !== 'number') {
      throw new Error('setHeight(): invalid parameter.');
    }

    const { mainElement } = this._dom;
    this._height = height;

    if (mainElement) {
      mainElement.setAttribute('height', height);
      mainElement.setAttribute('y', this._height * -0.5);
    }

    return this;
  }

  getHeight() {
    return this._height;
  }

  setSize(width, height) {
    this.__bulkAction = true;

    this.setWidth(width)
      .setHeight(height);

    this.__bulkAction = false;

    return this._drawConnections();
  }

  getSize() {
    return {
      width: this._width,
      height: this._height,
    };
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  adjustSize(boundingBox) {
    throw new Error('adjustSize(): This method should be implemented.');
  }

  getPortDescriptor(index) {
    const port = this._ports[index];

    if (port) {
      const descriptor = port.getDescriptor();

      descriptor.portIndex = index;

      return descriptor;
    }

    return null;
  }

  getPorts() {
    return this._ports.map((port, index) => this.getPortDescriptor(index));
  }

  addOutgoingConnection(connection) {
    if (!(connection instanceof Connection)) {
      throw new Error('setOutgoingConnection(): invalid parameter.');
    }

    this._connections.add(connection);

    if (connection.getOrigShape() !== this) {
      connection.setOrigShape(this);
    }

    return this;
  }

  getOutgoingConnections() {
    return new Set([...this._connections].filter((i) => i.getOrigShape() === this));
  }

  addIncomingConnection(connection) {
    if (!(connection instanceof Connection)) {
      throw new Error('setIncomingConnection(): invalid parameter');
    }

    this._connections.add(connection);

    if (connection.getDestShape() !== this) {
      connection.setOrigShape(this);
    }

    return this;
  }

  getIncomingConnections() {
    return new Set([...this._connections].filter((i) => i.getDestShape() === this));
  }

  getConnectedShapes() {
    return {
      prev: [...this.getIncomingConnections()].map((i) => i.getOrigShape()),
      next: [...this.getOutgoingConnections()].map((i) => i.getDestShape()),
    };
  }

  _removeFromPorts(connection) {
    this._ports.forEach((port) => {
      if (port.hasConnection(connection)) {
        port.removeConnection(connection);
      }
    });
    return this;
  }

  removeConnection(connection) {
    if (this._connections.delete(connection)) {
      this._removeFromPorts(connection);
      if (connection.isConnectedWith(this)) {
        connection.disconnect();
      }
    }
    return this;
  }

  removeConnections() {
    this._connections.forEach((connection) => {
      this.removeConnection(connection);
    });

    return this;
  }

  assignConnectionToPort(connection, portIndex) {
    this._removeFromPorts(connection);
    this._ports[portIndex].addConnection(connection);

    return this;
  }

  getBounds() {
    const halfWidth = this._width / 2;
    const halfHeight = this._height / 2;

    return {
      top: this._y - halfHeight,
      right: this._x + halfWidth,
      bottom: this._y + halfHeight,
      left: this._x - halfWidth,
    };
  }

  isUsingConnection(connection) {
    return this._connections.has(connection);
  }

  isBeingDragged() {
    return this._dragBehavior.isDragging();
  }

  isBeingResized() {
    return this._resizeBehavior.isDragging();
  }

  removeFromCanvas() {
    const oldCanvas = this._canvas;

    if (oldCanvas) {
      super.removeFromCanvas()
        .removeConnections();
    }

    return this;
  }

  hasAvailablePortFor(portIndex, mode) {
    const port = this._ports[portIndex];

    if (port) {
      if (port.mode === null) {
        const portsInMode = this._ports.filter(port => {
          return port.mode === mode;
        });

        return portsInMode.length < 3;
      }

      return port.isAvailableFor(mode);
    }

    return false;
  }

  /**
   * Add a graphic control for manipulating the Shape.
   * @param {SVGElement} svgElement An SVG element to be the graphic control for the Shape.
   * @param {Object} events An object in which the key is an event name and its value is a function or an array
   * in which each element is a function to be executed when that event occurs.
   */
  _addControl(svgElement, events) {
    this._controlsLayer.addControl(svgElement, events);
  }

  _resetPorts() {
    this._ports.forEach((port) => {
      port.clearConnections();
    });

    return this;
  }

  _drawConnections() {
    this._resetPorts();

    this._connections.forEach((connection) => {
      connection.connect();
    });

    return this;
  }

  _createHTML() {
    if (this._html) {
      return this;
    }

    super._createHTML();

    this._html.setAttribute('class', 'shape');
    this._html.setAttribute('transform', `translate(${this._x}, ${this._y})`);

    this._html.insertBefore(this._dom.mainElement, this._dom.title);
    this._html.prepend(this._controlsLayer.getHTML());

    this._connectivityBehavior.attachBehavior();
    this._dragBehavior.attachBehavior();
    this._selectBehavior.attachBehavior();
    this._resizeBehavior.attachBehavior();

    return this;
  }
}

export default Shape;
