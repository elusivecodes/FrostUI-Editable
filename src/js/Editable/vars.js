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
