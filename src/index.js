import { initComponent } from '@fr0st/ui';
import Editable from './editable.js';
import { _events } from './prototype/events.js';
import { _refresh, _updateValue } from './prototype/helpers.js';
import { _buildForm, _buildLoader, _renderInput } from './prototype/render.js';

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
initComponent('editable', Editable);

export default Editable;
