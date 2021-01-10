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
            dom.addEvent(this._input, 'keydown.ui.editable', e => {
                if (e.code !== 'Escape') {
                    return;
                }

                e.preventDefault();

                dom.setValue(this._input, this._value);
                this.hide();
            });

            dom.addEvent(this._input, 'change.ui.editable', _ => {
                console.log('change');
                dom.triggerEvent(this._form, 'submit.ui.editable');
            });
        }
    }

});
