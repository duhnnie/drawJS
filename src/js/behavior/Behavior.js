import FunctionProxy from '../utils/FunctionProxy';

const DEFAULTS = Object.freeze({
  disabled: false,
});

function canExecuteBehavior() {
  return !this._disabled && this._target;
}

class Behavior {
  constructor(target, settings) {
    this._target = target;

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    if (settings.disabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Proxies a function to execute it or not depending on the state of the behavior
   * (enabled/disabled). Bind the necessary methods to avoid the behavior to be executed.
   * Even if a Behavior has more than one method that make the behavior to perform, the majority of
   * times it will be enough by proxy just one method.
   * @protected
   * @param {Function} handler The function to be proxied.
   * @returns {Function} The proxied funciton.
   */
  _bind(handler) {
    return FunctionProxy.get(handler, canExecuteBehavior, this);
  }

  // eslint-disable-next-line class-methods-use-this
  end() {}

  disable() {
    this._disabled = true;
    this.end();
  }

  enable() {
    this._disabled = false;
  }

  getTarget() {
    return this._target;
  }

  isDisabled() {
    return this._disabled;
  }

  // TODO: this method is a workaround. Since most of behaviors functionality is based on its target's HTML this method
  // should be called from the target when its HTML is created.  If in the future we find a way to detect that an
  // object has created its HTML this method could be removed.
  attach() {
    this.enable();
  }

  /**
   * Remove the behavior permanently from its target.
   */
  detach() {
    this.disable();
    this._target = null;
  }
}

export default Behavior;
