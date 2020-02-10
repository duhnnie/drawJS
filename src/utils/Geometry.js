export default {
  /**
   * Returns the length of the sortest path between to points.
   * @param {Point} pointA
   * @param {Point} pointB
   */
  getPathLength(pointA, pointB) {
    return Math.abs(pointA.y - pointB.y) + Math.abs(pointA.x - pointB.x);
  },
  /**
   * Verifiy if a value is between two other values;
   * @param {Number} value The value to evaluate
   * @param {Number} min The low border
   * @param {Number} max The top border
   * @returns {Boolean}
   */
  isInBetween(value, min, max) {
    return value > min && value < max;
  },
  /**
   * Returns and object specifying is the boundaries overlaps each other in any dimension
   * @param {Object} boundsA Object with data representing a boundary
   * @param {Object} boundsB Object with data representing a boundary
   * @returns {Object} And object with 'x' and 'y' keys, and a Boolean as value.
   * It indicates if the boundaries overlap each other in x and/or y.
   */
  getOverlappedDimensions(boundsA, boundsB) {
    let x = false;
    let y = false;

    if (boundsA.left === boundsB.left || boundsA.right === boundsB.right
      || this.isInBetween(boundsB.left, boundsA.left, boundsA.right)
      || this.isInBetween(boundsA.left, boundsB.left, boundsB.right)) {
      x = true;
    }

    if (boundsA.top === boundsB.top || boundsA.bottom === boundsB.bottom
      || this.isInBetween(boundsB.top, boundsA.top, boundsA.bottom)
      || this.isInBetween(boundsA.top, boundsB.top, boundsB.bottom)) {
      y = true;
    }

    return { x, y };
  },
  /**
   * Returns an object that specifies the normalized relative position between an origin Shape
   * and a destination Shape.
   * If destination Shape is on the origin Shape's right the relative position on x is 1.
   * If destination Shape is on the origin Shape's left the relative position on x is -1.
   * If destination Shape is on the same x position than origin Shape,
   * then the relative postiion on x is 0.
   * If destination Shape is down the origin Shape the relative position on y is 1.
   * If destination Shape is up the origin Shape the relative position on y is -1.
   * If destination Shape is on the same y position than destination Shape,
   * then the relative position on y is 0.
   * @param {Point} originPoint Origin point
   * @param {Point} destinationPoint destination point
   * @return {Object} An object with 'x' and 'y' keys, whose values are the normalized 
   * relative position for those axis.
   */
  getNormalizedPosition(origPoint, destPoint) {
    const diffX = destPoint.x - origPoint.x;
    const diffY = destPoint.y - origPoint.y;

    return {
      x: diffX ? diffX / Math.abs(diffX) : 0,
      y: diffY ? diffY / Math.abs(diffY) : 0,
    };
  },
  /**
   * Verifies if two planes (defined by a boundary object) are overlapped.
   * @param {Object} boundsA An boundary object.
   * @param {Object} boundsB An boundary object.
   * @returns {Boolean}
   */
  areOverlapped(boundsA, boundsB) {
    const { x, y } = this.getOverlappedDimensions(boundsA, boundsB);

    return x && y;
  },
  /**
   * Returns value clamped to the inclusive range of min and max.
   * @param {*} value The value to be clamped
   * @param {*} limitA An inclusive border
   * @param {*} limitB An inclusive border
   */
  clamp(value, limitA, limitB) {
    const min = Math.min(limitA, limitB);
    const max = Math.max(limitA, limitB);

    if (value > max) {
      return max;
    }

    if (value < min) {
      return min;
    }

    return value;
  },
  /**
   * Creates an object with point structure.
   * @param {Number} x The x coordinate value.
   * @param {Number} y The y coordinate value.
   */
  toPoint(x, y) {
    return {
      x,
      y,
    };
  },
};