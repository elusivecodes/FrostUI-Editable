(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fr0st/ui'), require('@fr0st/query'), require('@fr0st/ui-autocomplete'), require('@fr0st/ui-colorpicker'), require('@fr0st/ui-datetimepicker'), require('@fr0st/ui-selectmenu')) :
    typeof define === 'function' && define.amd ? define(['exports', '@fr0st/ui', '@fr0st/query', '@fr0st/ui-autocomplete', '@fr0st/ui-colorpicker', '@fr0st/ui-datetimepicker', '@fr0st/ui-selectmenu'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.UI = global.UI || {}, global.UI, global.fQuery, global.UI.Autocomplete, global.UI.ColorPicker, global.UI.DateTimePicker, global.UI.SelectMenu));
})(this, (function (exports, ui, $, Autocomplete, ColorPicker, DateTimePicker, SelectMenu) { 'use strict';

    /**
     * Editable Class
     * @class
     */
    class Editable extends ui.BaseComponent {
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

    /**
     * Attach events for the Editable.
     */
    function _events() {
        $.addEvent(this._node, 'click.ui.editable', (e) => {
            if (!this._enabled) {
                return;
            }

            e.preventDefault();

            this._updateValue();
            this.show();
        });

        $.addEvent(this._input, 'keydown.ui.editable', (e) => {
            if (e.code !== 'Escape') {
                return;
            }

            e.preventDefault();

            $.setValue(this._input, this._value);
            this.hide();
        });

        if (this._options.buttons) {
            $.addEvent(this._cancel, 'click.ui.editable', (e) => {
                e.preventDefault();

                this.hide();
            });
        } else {
            $.addEvent(this._input, 'change.ui.editable', (_) => {
                $.triggerEvent(this._form, 'submit.ui.editable');
            });
        }

        $.addEvent(this._form, 'submit.ui.editable', (e) => {
            e.preventDefault();

            const value = this._options.getValue ?
                this._options.getValue(this._input, this) :
                $.getValue(this._input);

            const validate = this._options.validate(value, this._input, this);

            Promise.resolve(validate).then((error) => {
                if (error || value === this._value) {
                    throw new Error(error);
                }

                $.before(this._node, this._loader);
                $.hide(this._form);

                return this._options.saveValue(value, this._input, this);
            }).then((_) => {
                this._value = value;
                this._refresh();

                $.triggerEvent(this._node, 'saved.ui.editable');

                this.hide();
            }).catch((error) => {
                if (!error.message) {
                    return this.hide();
                }

                $.setHTML(this._error, error);
                $.show(this._error);
                $.addClass(this._form, this.constructor.classes.formError);
            }).finally((_) => {
                $.detach(this._loader);
                $.show(this._form);
            });
        });
    }

    /**
     * Refresh the current value.
     */
    function _refresh(useCurrentLabel = false) {
        $.removeClass(this._node, this.constructor.classes.empty);
        $.removeClass(this._node, this.constructor.classes.editable);

        if (!this._enabled) {
            $.removeAttribute(this._node, 'role');
            $.removeAttribute(this._node, 'title');
            $.setStyle(this._node, { borderBottomStyle: '' });

            return;
        }

        $.setAttribute(this._node, {
            role: 'button',
            title: this._options.lang.title,
        });

        if (this._options.borderStyle) {
            $.setStyle(this._node, { borderBottomStyle: this._options.borderStyle }, null, { important: true });
        }

        Promise.resolve(this._getLabel()).then((label) => {
            if (!this._enabled) {
                return;
            }

            if (!label && useCurrentLabel) {
                label = $.getText(this._node);
            }

            if (!label) {
                $.setText(this._node, this._options.emptyText);
                $.addClass(this._node, this.constructor.classes.empty);
                return;
            }

            $.setText(this._node, label);
            $.addClass(this._node, this.constructor.classes.editable);
        });
    }
    /**
     * Update the current value.
     */
    function _updateValue() {
        if (this._options.setValue) {
            this._options.setValue(this._input, this._value, this);
        } else if (this._selectmenu) {
            this._selectmenu.setValue(this._value);
        } else if (this._datetimepicker) {
            this._datetimepicker.setDate(this._value);
        } else if (this._colorpicker) {
            this._colorpicker.setColor(this._value);
        } else {
            $.setValue(this._input, this._value);
        }
    }

    /**
     * Build the editable form.
     */
    function _buildForm() {
        this._form = $.create('form');

        this._inputGroup = $.create('div', {
            class: this._options.inputStyle === 'filled' ?
                this.constructor.classes.inputGroupFilled :
                this.constructor.classes.inputGroupOutline,
        });
        $.append(this._form, this._inputGroup);

        this._renderInput();

        if (this._options.buttons) {
            this._submit = $.create('button', {
                html: this._options.lang.save,
                class: this.constructor.classes.saveButton,
                attributes: {
                    type: 'submit',
                },
            });

            this._cancel = $.create('button', {
                html: this._options.lang.cancel,
                class: this.constructor.classes.cancelButton,
                attributes: {
                    type: 'button',
                },
            });

            if (this._options.buttons === 'bottom') {
                const buttonContainer = $.create('div', {
                    class: this.constructor.classes.buttonContainer,
                });
                $.append(this._form, buttonContainer);

                $.append(buttonContainer, this._submit);
                $.append(buttonContainer, this._cancel);
            } else {
                $.append(this._inputGroup, this._submit);
                $.append(this._inputGroup, this._cancel);
            }
        }

        this._error = $.create('div', {
            class: this.constructor.classes.error,
        });
        $.append(this._form, this._error);
        $.hide(this._error);

        if (this._options.initInput) {
            this._options.initInput(this._input, this);
        } else if (this._options.selectmenu) {
            this._selectmenu = SelectMenu.init(this._input, this._options.selectmenu);
        } else if (this._options.datetimepicker) {
            this._datetimepicker = DateTimePicker.init(this._input, this._options.datetimepicker);
        } else if (this._options.colorpicker) {
            this._colorpicker = ColorPicker.init(this._input, this._options._colorpicker);
        } else if (this._options.autocomplete) {
            this._autocomplete = Autocomplete.init(this._input, this._options.autocomplete);
        }
    }
    /**
     * Build the loader.
     */
    function _buildLoader() {
        this._loader = $.create('span', {
            class: this.constructor.classes.spinner,
        });
    }
    /**
     * Render the input element.
     */
    function _renderInput() {
        const inputContainer = $.create('div', {
            class: this.constructor.classes.inputContainer,
        });
        $.append(this._inputGroup, inputContainer);

        const attributes = {};

        let inputTag;
        switch (this._options.type) {
            case 'select':
            case 'textarea':
                inputTag = this._options.type;
                break;
            default:
                inputTag = 'input';
                attributes.type = this._options.type;
                break;
        }

        this._input = $.create(inputTag, {
            class: this._options.inputStyle === 'filled' ?
                this.constructor.classes.inputFilled :
                this.constructor.classes.inputOutline,
            attributes: {
                ...attributes,
                ...this._options.inputAttributes,
            },
        });

        if (this._options.inputClass) {
            $.addClass(this._input, this._options.inputClass);
        }

        $.append(inputContainer, this._input);

        if (this._options.type === 'select' && this._options.data) {
            for (const item of this._options.data) {
                const option = $.create('option', {
                    text: item.text,
                    attributes: {
                        value: item.value,
                    },
                });
                $.append(this._input, option);
            }
        }

        if (this._options.inputStyle === 'filled') {
            const ripple = $.create('div', {
                class: this.constructor.classes.inputRipple,
            });
            $.append(inputContainer, ripple);
        }
    }

    // Editable default options
    Editable.defaults = {
        type: 'text',
        value: null,
        emptyText: 'Empty',
        separator: ', ',
        inputAttributes: {},
        inputClass: null,
        inputStyle: 'filled',
        borderStyle: 'dotted',
        lang: {
            title: 'Click to edit',
            save: 'Save',
            cancel: 'Cancel',
        },
        buttons: true,
        getLabel: null,
        getValue: null,
        initInput: null,
        saveValue: (value) => value,
        setValue: null,
        validate: (_) => '',
        selectmenu: null,
        datetimepicker: null,
        colorpicker: null,
        autocomplete: null,
    };

    // Default classes
    Editable.classes = {
        buttonContainer: 'd-flex gap-1 mt-1',
        cancelButton: 'btn btn-light ripple',
        editable: 'link-primary border-bottom border-primary',
        empty: 'link-danger fst-italic border-bottom border-danger',
        error: 'invalid-feedback',
        formError: 'form-error',
        inputContainer: 'form-input',
        inputFilled: 'input-filled',
        inputGroupFilled: 'input-group input-group-filled',
        inputGroupOutline: 'input-group',
        inputOutline: 'input-outline',
        inputRipple: 'ripple-line',
        saveButton: 'btn btn-primary ripple',
        spinner: 'spinner-border spinner-border-sm text-primary',
    };

    // Editable prototype
    const proto = Editable.prototype;

    proto._buildForm = _buildForm;
    proto._buildLoader = _buildLoader;
    proto._events = _events;
    proto._refresh = _refresh;
    proto._renderInput = _renderInput;
    proto._updateValue = _updateValue;

    // Editable init
    ui.initComponent('editable', Editable);

    exports.Editable = Editable;

}));
//# sourceMappingURL=frost-ui-editable.js.map
