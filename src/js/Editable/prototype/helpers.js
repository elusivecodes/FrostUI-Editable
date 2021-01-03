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
            return;
        }

        let label;
        if (this._settings.getLabel) {
            label = this._settings.getLabel(this._value, this._input, this);
        } else if (this._settings.type === 'select') {
            if (Core.isArray(this._value)) {
                const labels = [];
                for (const val of this._value) {
                    const option = dom.findOne(`option[value="${val}"]`, this._input);
                    const thisLabel = dom.getText(option);
                    labels.push(thisLabel);
                }
                label = labels.join(this._settings.separator);
            } else {
                const option = dom.findOne(`option[value="${this._value}"]`, this._input);
                label = dom.getText(option);
            }
        } else {
            label = this._value;
        }

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
        } else {
            dom.setValue(this._input, this._value);
        }
    }

});
