import $ from '@fr0st/query';

/**
 * Refresh the current value.
 */
export function _refresh(useCurrentLabel = false) {
    $.removeClass(this._node, this.constructor.classes.empty);
    $.removeClass(this._node, this.constructor.classes.editable);

    if (!this._enabled) {
        $.removeAttribute(this._node, 'role');
        $.removeAttribute(this._node, 'title');
        $.setStyle(this._node, { borderBottomStyle: '' });

        return;
    }

    $.setAttribute(this._node, {
        role: 'button',
        title: this._options.lang.title,
    });

    if (this._options.borderStyle) {
        $.setStyle(this._node, { borderBottomStyle: this._options.borderStyle }, null, { important: true });
    }

    Promise.resolve(this._getLabel()).then((label) => {
        if (!this._enabled) {
            return;
        }

        if (!label && useCurrentLabel) {
            label = $.getText(this._node);
        }

        if (!label) {
            $.setText(this._node, this._options.emptyText);
            $.addClass(this._node, this.constructor.classes.empty);
            return;
        }

        $.setText(this._node, label);
        $.addClass(this._node, this.constructor.classes.editable);
    });
};

/**
 * Update the current value.
 */
export function _updateValue() {
    if (this._options.setValue) {
        this._options.setValue(this._input, this._value, this);
    } else if (this._selectmenu) {
        this._selectmenu.setValue(this._value);
    } else if (this._datetimepicker) {
        this._datetimepicker.setDate(this._value);
    } else if (this._colorpicker) {
        this._colorpicker.setColor(this._value);
    } else {
        $.setValue(this._input, this._value);
    }
};
