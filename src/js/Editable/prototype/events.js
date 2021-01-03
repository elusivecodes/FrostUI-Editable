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

            dom.before(this._node, this._form);
            dom.hide(this._node);
            dom.focus(this._input);
        });

        dom.addEvent(this._form, 'submit.ui.editable', e => {
            e.preventDefault();

            const value = this._settings.getValue ?
                this._settings.getValue(this._input, this) :
                dom.getValue(this._input);

            if (value === this._value) {
                dom.detach(this._form);
                dom.show(this._node);
                return;
            }

            const request = this._settings.saveValue(value, this._input, this);

            dom.before(this._node, this._loader);
            dom.hide(this._form);
            Promise.resolve(request).then(_ => {
                this._value = value;
                this._refresh();

                dom.detach(this._form);
                dom.show(this._node);
            }).finally(_ => {
                dom.detach(this._loader);
                dom.show(this._form);
            });
        });

        if (this._settings.buttons) {
            dom.addEvent(this._cancel, 'click.ui.editable', e => {
                e.preventDefault();

                dom.detach(this._form);
                dom.show(this._node);
            });
        } else if (this._settings.type === 'select') {
            dom.addEvent(this._input, 'change.ui.editable', _ => {
                dom.triggerEvent(this._form, 'submit.ui.editable');
            });
        }
    }

});
