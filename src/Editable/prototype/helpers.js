/**
 * Editable Helpers
 */

Object.assign(Editable.prototype, {

    /**
     * Refresh the current value.
     */
    _refresh(useCurrentLabel = false) {
        dom.removeClass(this._node, this.constructor.classes.empty);
        dom.removeClass(this._node, this.constructor.classes.editable);

        if (!this._enabled) {
            dom.removeAttribute(this._node, 'role');
            dom.setStyle(this._node, 'borderBottomStyle', '');

            return;
        }

        dom.setAttribute(this._node, 'role', 'button');

        if (this._settings.borderStyle) {
            dom.setStyle(this._node, 'borderBottomStyle', this._settings.borderStyle, true);
        }

        Promise.resolve(this._getLabel()).then(label => {
            if (!label && useCurrentLabel) {
                label = dom.getText(this._node);
            }

            if (!label) {
                dom.setText(this._node, this._settings.emptyText);
                dom.addClass(this._node, this.constructor.classes.empty);
                return;
            }

            dom.setText(this._node, label);
            dom.addClass(this._node, this.constructor.classes.editable);
        });
    },

    /**
     * Update the current value.
     */
    _updateValue() {
        if (this._settings.setValue) {
            this._settings.setValue(this._input, this._value, this);
        } else if (this._selectmenu) {
            this._selectmenu.setValue(this._value);
        } else if (this._datetimepicker) {
            this._datetimepicker.setDate(this._value);
        } else if (this._colorpicker) {
            this._colorpicker.setColor(this._value);
        } else {
            dom.setValue(this._input, this._value);
        }
    }

});
