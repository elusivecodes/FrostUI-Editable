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
    editable: 'link-primary editable',
    empty: 'link-danger fst-italic editable-empty',
    error: 'invalid-feedback',
    formError: 'form-error',
    inputContainer: 'form-input',
    inputFilled: 'input-filled',
    inputGroupFilled: 'input-group input-group-filled',
    inputGroupOutline: 'input-group',
    inputOutline: 'input-outline',
    inputRipple: 'ripple-line',
    saveButton: 'btn btn-success ripple',
    spinner: 'spinner-border spinner-border-sm text-primary'
};

UI.initComponent('editable', Editable);

UI.Editable = Editable;
