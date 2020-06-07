import Factory from '../core/Factory';
import ShapePositioningCommand from './ShapePositioningCommand';
import ShapeTextCommand from './ShapeTextCommand';
import ShapeResizeCommand from './ShapeResizeCommand';
import ShapeRemoveCommand from './ShapeRemoveCommand';

const PRODUCTS = Object.freeze({
  SHAPE_POSITION: 'shape_position',
  SHAPE_TEXT: 'shape_text',
  SHAPE_RESIZE: 'shape_resize',
  SHAPE_REMOVE: 'shape_remove',
});

const CommandFactory = new Factory({
  products: {
    [PRODUCTS.SHAPE_POSITION]: ShapePositioningCommand,
    [PRODUCTS.SHAPE_TEXT]: ShapeTextCommand,
    [PRODUCTS.SHAPE_RESIZE]: ShapeResizeCommand,
    [PRODUCTS.SHAPE_REMOVE]: ShapeRemoveCommand,
  },
});

export default CommandFactory;
export { PRODUCTS };
