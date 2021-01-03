/**
 * FrostUI-Editable v1.0
 * https://github.com/elusivecodes/FrostUI-Editable
 */
(function(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory;
    } else {
        factory(global);
    }

})(window, function(window) {
    'use strict';

    if (!window) {
        throw new Error('FrostUI-Editable requires a Window.');
    }

    if (!('UI' in window)) {
        throw new Error('FrostUI-Editable requires FrostUI.');
    }

    const Core = window.Core;
    const dom = window.dom;
    const QuerySet = window.QuerySet;
    const UI = window.UI;
    const document = window.document;

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


    /**
     * Editable Events
     */

    Object.assign(Editable.prototype, {

        /**
         * Attach events for the Editable.
         */
        _events() {
            dom.addEvent(this._node, 'click.ui.editable', e => {
                if (!this._enabled) {
                    return;
                }

                e.preventDefault();

                this._updateValue();

                dom.before(this._node, this._form);
                dom.hide(this._node);
                dom.focus(this._input);
            });

            dom.addEvent(this._form, 'submit.ui.editable', e => {
                e.preventDefault();

                const value = this._settings.getValue ?
                    this._settings.getValue(this._input, this) :
                    dom.getValue(this._input);

                if (value === this._value) {
                    dom.detach(this._form);
                    dom.show(this._node);
                    return;
                }

                const request = this._settings.saveValue(value, this._input, this);

                dom.before(this._node, this._loader);
                dom.hide(this._form);
                Promise.resolve(request).then(_ => {
                    this._value = value;
                    this._refresh();

                    dom.detach(this._form);
                    dom.show(this._node);
                }).finally(_ => {
                    dom.detach(this._loader);
                    dom.show(this._form);
                });
            });

            if (this._settings.buttons) {
                dom.addEvent(this._cancel, 'click.ui.editable', e => {
                    e.preventDefault();

                    dom.detach(this._form);
                    dom.show(this._node);
                });
            } else if (this._settings.type === 'select') {
                dom.addEvent(this._input, 'change.ui.editable', _ => {
                    dom.triggerEvent(this._form, 'submit.ui.editable');
                });
            }
        }

    });


    /**
     * Editable Helpers
     */

    Object.assign(Editable.prototype, {

        /**
         * Refresh the current value.
         */
        _refresh(useCurrentLabel = false) {
            dom.removeClass(this._node, this.constructor.classes.empty);
            dom.removeClass(this._node, this.constructor.classes.editable);

            if (!this._enabled) {
                return;
            }

            let label;
            if (this._settings.getLabel) {
                label = this._settings.getLabel(this._value, this._input, this);
            } else if (this._settings.type === 'select') {
                if (Core.isArray(this._value)) {
                    const labels = [];
                    for (const val of this._value) {
                        const option = dom.findOne(`option[value="${val}"]`, this._input);
                        const thisLabel = dom.getText(option);
                        labels.push(thisLabel);
                    }
                    label = labels.join(this._settings.separator);
                } else {
                    const option = dom.findOne(`option[value="${this._value}"]`, this._input);
                    label = dom.getText(option);
                }
            } else {
                label = this._value;
            }

            if (!label && useCurrentLabel) {
                label = dom.getText(this._node);
            }

            if (!label) {
                dom.setText(this._node, this._settings.emptyText);
                dom.addClass(this._node, this.constructor.classes.empty);
                return;
            }

            dom.setText(this._node, label);
            dom.addClass(this._node, this.constructor.classes.editable);
        },

        /**
         * Update the current value.
         */
        _updateValue() {
            if (this._settings.setValue) {
                this._settings.setValue(this._input, this._value, this);
            } else if (this._selectmenu) {
                this._selectmenu.setValue(this._value);
            } else if (this._datetimepicker) {
                this._datetimepicker.setDate(this._value);
            } else {
                dom.setValue(this._input, this._value);
            }
        }

    });


    /**
     * Editable Render
     */

    Object.assign(Editable.prototype, {

        /**
         * Build the editable form.
         */
        _buildForm() {
            this._form = dom.create('form');

            this._inputGroup = dom.create('div', {
                class: this._settings.inputStyle === 'filled' ?
                    this.constructor.classes.inputGroupFilled :
                    this.constructor.classes.inputGroupOutline
            });
            dom.append(this._form, this._inputGroup);

            this._renderInput();

            if (this._settings.initInput) {
                this._settings.initInput(this._input, this);
            } else if (this._settings.selectmenu) {
                this._selectmenu = UI.SelectMenu.init(this._input, this._settings.selectmenu);
            } else if (this._settings.datetimepicker) {
                this._datetimepicker = UI.DateTimePicker.init(this._input, this._settings.datetimepicker);
            }

            if (this._settings.buttons) {
                this._submit = dom.create('button', {
                    html: `<span class="${this._settings.icons.save}"></span>`,
                    class: this.constructor.classes.saveButton,
                    attributes: {
                        type: 'submit'
                    }
                });
                dom.append(this._inputGroup, this._submit);

                this._cancel = dom.create('button', {
                    html: `<span class="${this._settings.icons.cancel}"></span>`,
                    class: this.constructor.classes.cancelButton,
                    attributeS: {
                        type: 'button'
                    }
                });
                dom.append(this._inputGroup, this._cancel);
            }
        },

        /**
         * Build the loader.
         */
        _buildLoader() {
            this._loader = dom.create('span', {
                class: this.constructor.classes.spinner
            });
        },

        /**
         * Render the input element.
         */
        _renderInput() {
            const inputContainer = dom.create('div', {
                class: this.constructor.classes.inputContainer
            });
            dom.append(this._inputGroup, inputContainer);

            const attributes = {};

            let inputTag;
            switch (this._settings.type) {
                case 'select':
                case 'textarea':
                    inputTag = this._settings.type;
                    break;
                default:
                    inputTag = 'input';
                    attributes.type = this._settings.type;
                    break;
            }

            this._input = dom.create(inputTag, {
                class: this._settings.inputStyle === 'filled' ?
                    this.constructor.classes.inputFilled :
                    this.constructor.classes.inputOutline,
                attributes: {
                    ...attributes,
                    ...this._settings.inputAttributes
                }
            });

            if (this._settings.inputClass) {
                dom.addClass(this._input, this._settings.inputClass);
            }

            dom.append(inputContainer, this._input);

            if (this._settings.type === 'select' && this._settings.data) {
                for (const item of this._settings.data) {
                    const option = dom.create('option', {
                        text: item.text,
                        attributes: {
                            value: item.value
                        }
                    });
                    dom.append(this._input, option);
                }
            }

            if (this._settings.inputStyle === 'filled') {
                const ripple = dom.create('div', {
                    class: this.constructor.classes.inputRipple
                });
                dom.append(inputContainer, ripple);
            }
        }

    });


    // Editable default options
    Editable.defaults = {
        type: 'text',
        value: null,
        emptyText: 'Empty',
        separator: ', ',
        inputAttributes: {},
        inputClass: null,
        inputStyle: 'filled',
        icons: {
            save: 'icon icon-tick fw-bolder',
            cancel: 'icon icon-cancel'
        },
        buttons: true,
        getLabel: null,
        getValue: null,
        initInput: null,
        saveValue: _ => { },
        setValue: null,
        selectmenu: null,
        datetimepicker: null
    };

    // Default classes
    Editable.classes = {
        cancelButton: 'btn btn-danger ripple',
        editable: 'editable',
        empty: 'editable-empty',
        inputContainer: 'form-input',
        inputFilled: 'input-filled',
        inputGroupFilled: 'input-group input-group-filled',
        inputGroupOutline: 'input-group input-group-outline',
        inputOutline: 'input-outline',
        inputRipple: 'ripple-line',
        saveButton: 'btn btn-success ripple',
        spinner: 'spinner-border spinner-border-sm text-primary'
    };

    UI.initComponent('editable', Editable);

    UI.Editable = Editable;

});