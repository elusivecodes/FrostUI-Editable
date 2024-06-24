import $ from '@fr0st/query';

/**
 * Attach events for the Editable.
 */
export function _events() {
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
