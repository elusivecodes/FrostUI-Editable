import $ from '@fr0st/query';
import { BaseComponent } from '@fr0st/ui';

/**
 * Editable Class
 * @class
 */
export default class Editable extends BaseComponent {
    /**
     * New Editable constructor.
     * @param {HTMLElement} node The input node.
     * @param {object} [settings] The options to create the Editable with.
     * @returns {Editable} A new Editable object.
     */
    constructor(node, settings) {
        super(node, settings);

        this._value = this._options.value === null ?
            $.getText(this._node) :
            this._options.value;

        this._enabled = true;

        this._getLabel = (_) => {
            if (this._options.getLabel) {
                return this._options.getLabel(this._value, this._input, this);
            }

            if (this._selectmenu) {
                const data = this._selectmenu.data();
                return data ? data.text : null;
            }

            if (this._options.type !== 'select') {
                return this._value;
            }

            if (!$._isArray(this._value)) {
                const option = $.findOne(`option[value="${this._value}"]`, this._input);
                return option ? $.getText(option) : null;
            }

            const labels = [];
            for (const val of this._value) {
                const option = $.findOne(`option[value="${val}"]`, this._input);
                const thisLabel = $.getText(option);
                labels.push(thisLabel);
            }

            return labels.length ? labels.join(this._options.separator) : null;
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

        $.detach(this._form);
        $.show(this._node);

        return this;
    }

    /**
     * Dispose the Editable.
     */
    dispose() {
        $.removeClass(this._node, this.constructor.classes.empty);
        $.removeClass(this._node, this.constructor.classes.editable);
        $.removeAttribute(this._node, 'role');
        $.removeAttribute(this._node, 'title');
        $.setStyle(this._node, { borderBottomStyle: '' });
        $.removeEvent(this._node, 'click.ui.editable');

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

        $.remove(this._form);
        $.show(this._node);

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
        if (!$.triggerOne(this._node, 'hide.ui.editable')) {
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

        $.detach(this._form);
        $.show(this._node);

        $.setHTML(this._error, '');
        $.hide(this._error);
        $.removeClass(this._form, this.constructor.classes.formError);

        $.triggerEvent(this._node, 'hidden.ui.editable');

        return this;
    }

    /**
     * Show the Editable form.
     * @returns {Editable} The Editable.
     */
    show() {
        if (!$.triggerOne(this._node, 'show.ui.editable')) {
            return this;
        }

        $.before(this._node, this._form);
        $.hide(this._node);
        $.focus(this._input);

        $.triggerEvent(this._node, 'shown.ui.editable');

        return this;
    }

    /**
     * Toggle the Editable form.
     * @returns {Editable} The Editable.
     */
    toggle() {
        return $.isConnected(this._form) ?
            this.hide() :
            this.show();
    }
}
