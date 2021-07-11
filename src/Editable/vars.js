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
        save: 'Save',
        cancel: 'Cancel'
    },
    buttons: true,
    getLabel: null,
    getValue: null,
    initInput: null,
    saveValue: value => value,
    setValue: null,
    validate: _ => '',
    selectmenu: null,
    datetimepicker: null,
    colorpicker: null,
    autocomplete: null
};

// Default classes
Editable.classes = {
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
    spinner: 'spinner-border spinner-border-sm text-primary'
};

UI.initComponent('editable', Editable);

UI.Editable = Editable;
