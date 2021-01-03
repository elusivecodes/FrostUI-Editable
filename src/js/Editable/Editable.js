/**
 * Editable Class
 * @class
 */
class Editable extends UI.BaseComponent {

    /**
     * New Editable constructor.
     * @param {HTMLElement} node The input node.
     * @param {object} [settings] The options to create the Editable with.
     * @returns {Editable} A new Editable object.
     */
    constructor(node, settings) {
        super(node, settings);

        this._value = this._settings.value === null ?
            dom.getText(this._node) :
            this._settings.value;

        this._enabled = true;

        this._buildForm();
        this._buildLoader();
        this._events();
        this._refresh(true);
    }

    /**
     * Dispose the Editable.
     */
    dispose() {
        dom.removeEvent(this._node, 'click.ui.editable');

        if (this._value) {
            dom.removeClass(this._node, 'editable');
        } else {
            dom.removeClass(this._node, 'editable-empty');
        }

        dom.remove(this._form);
        dom.show(this._node);

        if (this._selectmenu) {
            this._selectmenu.dispose();
        } else if (this._datetimepicker) {
            this._datetimepicker.dispose();
        }

        super.dispose();
    }

    /**
     * Disable the Editable.
     * @returns {Editable} The Editable.
     */
    disable() {
        this._enabled = false;
        this._refresh();

        dom.detach(this._form);
        dom.show(this._node);

        return this;
    }

    /**
     * Enable the Editable.
     * @returns {Editable} The Editable.
     */
    enable() {
        this._enabled = true;
        this._refresh();

        return this;
    }

    /**
     * Get the current value.
     * @returns {string|number|array} The current value.
     */
    getValue() {
        return this._value;
    }

    /**
     * Set the current value.
     * @param {string|number|array} value The value to set.
     * @returns {Editable} The Editable.
     */
    setValue(value) {
        if (this._enabled) {
            this._value = value;

            if (dom.isConnected(this._form)) {
                this._updateValue();
            } else {
                this._refresh();
            }
        }

        return this;
    }

}
