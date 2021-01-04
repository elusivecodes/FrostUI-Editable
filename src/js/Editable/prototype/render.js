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

        this._error = dom.create('div', {
            class: this.constructor.classes.error
        });
        dom.append(this._form, this._error);
        dom.hide(this._error);
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
