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
            } else if (this._autocomplete) {
                this._autocomplete.dispose();
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
         * Hide the Editable form.
         * @returns {Editable} The Editable.
         */
        hide() {
            dom.detach(this._form);
            dom.show(this._node);

            dom.setHTML(this._error, '');
            dom.hide(this._error);
            dom.removeClass(this._form, this.constructor.classes.formError);

            dom.triggerEvent(this._node, 'hidden.ui.editable');

            return this;
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

        /**
         * Show the Editable form.
         * @returns {Editable} The Editable.
         */
        show() {
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
                this.show();
            });

            dom.addEvent(this._form, 'submit.ui.editable', e => {
                e.preventDefault();

                const value = this._settings.getValue ?
                    this._settings.getValue(this._input, this) :
                    dom.getValue(this._input);

                if (this._settings.validate) {
                    const error = this._settings.validate(value, this._input, this);
                    if (error) {
                        dom.setHTML(this._error, error);
                        dom.show(this._error);
                        dom.addClass(this._form, this.constructor.classes.formError);
                        return;
                    }
                }

                if (value === this._value) {
                    this.hide();
                    return;
                }

                const request = this._settings.saveValue(value, this._input, this);

                dom.before(this._node, this._loader);
                dom.hide(this._form);
                Promise.resolve(request).then(_ => {
                    this._value = value;
                    this._refresh();

                    this.hide();

                    dom.triggerEvent(this._node, 'saved.ui.editable');
                }).catch(_ => {
                    // error
                }).finally(_ => {
                    dom.detach(this._loader);
                    dom.show(this._form);
                });
            });

            if (this._settings.buttons) {
                dom.addEvent(this._cancel, 'click.ui.editable', e => {
                    e.preventDefault();

                    this.hide();
                });
            } else {
                dom.addEvent(this._input, 'change.ui.editable blur.ui.editable', _ => {
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

            Promise.resolve(this._getLabel()).then(label => {
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
            });
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

            if (this._settings.buttons) {
                this._submit = dom.create('button', {
                    html: this._settings.lang.save,
                    class: this.constructor.classes.saveButton,
                    attributes: {
                        type: 'submit'
                    }
                });

                this._cancel = dom.create('button', {
                    html: this._settings.lang.cancel,
                    class: this.constructor.classes.cancelButton,
                    attributes: {
                        type: 'button'
                    }
                });

                if (this._settings.buttons === 'bottom') {
                    const buttonContainer = dom.create('div', {
                        class: 'mt-1'
                    });
                    dom.append(this._form, buttonContainer);

                    dom.addClass(this._submit, 'me-1');
                    dom.append(buttonContainer, this._submit);
                    dom.append(buttonContainer, this._cancel);
                } else {
                    dom.append(this._inputGroup, this._submit);
                    dom.append(this._inputGroup, this._cancel);
                }
            }

            this._error = dom.create('div', {
                class: this.constructor.classes.error
            });
            dom.append(this._form, this._error);
            dom.hide(this._error);

            if (this._settings.initInput) {
                this._settings.initInput(this._input, this);
            } else if (this._settings.selectmenu) {
                this._selectmenu = UI.SelectMenu.init(this._input, this._settings.selectmenu);
            } else if (this._settings.datetimepicker) {
                this._datetimepicker = UI.DateTimePicker.init(this._input, this._settings.datetimepicker);
            } else if (this._settings.autocomplete) {
                this._autocomplete = UI.Autocomplete.init(this._input, this._settings.autocomplete);
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
        lang: {
            save: 'Save',
            cancel: 'Cancel'
        },
        buttons: true,
        getLabel: null,
        getValue: null,
        initInput: null,
        saveValue: _ => { },
        setValue: null,
        validate: null,
        autocomplete: null,
        selectmenu: null,
        datetimepicker: null
    };

    // Default classes
    Editable.classes = {
        cancelButton: 'btn btn-danger ripple',
        editable: 'editable',
        empty: 'editable-empty',
        error: 'invalid-feedback',
        formError: 'form-error',
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