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

        this._getLabel = _ => {
            if (this._settings.getLabel) {
                return this._settings.getLabel(this._value, this._input, this);
            }

            if (this._selectmenu) {
                const data = this._selectmenu.data();
                return data ? data.text : null;
            }

            if (this._settings.type !== 'select') {
                return this._value;
            }

            if (!Core.isArray(this._value)) {
                const option = dom.findOne(`option[value="${this._value}"]`, this._input);
                return option ? dom.getText(option) : null;
            }

            const labels = [];
            for (const val of this._value) {
                const option = dom.findOne(`option[value="${val}"]`, this._input);
                const thisLabel = dom.getText(option);
                labels.push(thisLabel);
            }
            return labels.length ? labels.join(this._settings.separator) : null;
        };

        this._buildForm();
        this._buildLoader();
        this._events();
        this._refresh(true);
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
     * Dispose the Editable.
     */
    dispose() {
        dom.removeClass(this._node, this.constructor.classes.empty);
        dom.removeClass(this._node, this.constructor.classes.editable);
        dom.removeAttribute(this._node, 'role');
        dom.setStyle(this._node, 'borderBottomStyle', '');
        dom.removeEvent(this._node, 'click.ui.editable');

        if (this._selectmenu) {
            this._selectmenu.dispose();
            this._selectmenu = null;
        } else if (this._datetimepicker) {
            this._datetimepicker.dispose();
            this._datetimepicker = null;
        } else if (this._colorpicker) {
            this._colorpicker.dispose();
            this._colorpicker = null;
        } else if (this._autocomplete) {
            this._autocomplete.dispose();
            this._autocomplete = null;
        }

        dom.remove(this._form);
        dom.show(this._node);

        this._form = null;
        this._input = null;
        this._inputGroup = null;
        this._submit = null;
        this._cancel = null;
        this._error = null;
        this._loader = null;
        this._getLabel = null;

        super.dispose();
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
     * Hide the Editable form.
     * @returns {Editable} The Editable.
     */
    hide() {
        if (!dom.triggerOne(this._node, 'hide.ui.editable')) {
            return this;
        }

        if (this._selectmenu) {
            this._selectmenu.hide();
        } else if (this._datetimepicker) {
            this._datetimepicker.hide();
        } else if (this._colorpicker) {
            this._colorpicker.hide();
        } else if (this._autocomplete) {
            this._autocomplete.hide();
        }

        dom.detach(this._form);
        dom.show(this._node);

        dom.setHTML(this._error, '');
        dom.hide(this._error);
        dom.removeClass(this._form, this.constructor.classes.formError);

        dom.triggerEvent(this._node, 'hidden.ui.editable');

        return this;
    }

    /**
     * Show the Editable form.
     * @returns {Editable} The Editable.
     */
    show() {
        if (!dom.triggerOne(this._node, 'show.ui.editable')) {
            return this;
        }

        dom.before(this._node, this._form);
        dom.hide(this._node);
        dom.focus(this._input);

        dom.triggerEvent(this._node, 'shown.ui.editable');

        return this;
    }

    /**
     * Toggle the Editable form.
     * @returns {Editable} The Editable.
     */
    toggle() {
        return dom.isConnected(this._form) ?
            this.hide() :
            this.show();
    }

}
