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

        dom.addEvent(this._input, 'keydown.ui.editable', e => {
            if (e.code !== 'Escape') {
                return;
            }

            e.preventDefault();

            dom.setValue(this._input, this._value);
            this.hide();
        });

        if (this._settings.buttons) {
            dom.addEvent(this._cancel, 'click.ui.editable', e => {
                e.preventDefault();

                this.hide();
            });
        } else {
            dom.addEvent(this._input, 'change.ui.editable', _ => {
                dom.triggerEvent(this._form, 'submit.ui.editable');
            });
        }

        dom.addEvent(this._form, 'submit.ui.editable', e => {
            e.preventDefault();

            const value = this._settings.getValue ?
                this._settings.getValue(this._input, this) :
                dom.getValue(this._input);

            const validate = this._settings.validate(value, this._input, this);

            Promise.resolve(validate).then(error => {
                if (error || value === this._value) {
                    throw new Error(error);
                }

                dom.before(this._node, this._loader);
                dom.hide(this._form);

                return this._settings.saveValue(value, this._input, this);
            }).then(_ => {
                this._value = value;
                this._refresh();

                dom.triggerEvent(this._node, 'saved.ui.editable');

                this.hide();
            }).catch(error => {
                if (!error.message) {
                    return this.hide();
                }

                dom.setHTML(this._error, error);
                dom.show(this._error);
                dom.addClass(this._form, this.constructor.classes.formError);
            }).finally(_ => {
                dom.detach(this._loader);
                dom.show(this._form);
            });
        });
    }

});
