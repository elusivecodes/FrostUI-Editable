import $ from '@fr0st/query';
import Autocomplete from '@fr0st/ui-autocomplete';
import ColorPicker from '@fr0st/ui-colorpicker';
import DateTimePicker from '@fr0st/ui-datetimepicker';
import SelectMenu from '@fr0st/ui-selectmenu';

/**
 * Build the editable form.
 */
export function _buildForm() {
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
};

/**
 * Build the loader.
 */
export function _buildLoader() {
    this._loader = $.create('span', {
        class: this.constructor.classes.spinner,
    });
};

/**
 * Render the input element.
 */
export function _renderInput() {
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
};
