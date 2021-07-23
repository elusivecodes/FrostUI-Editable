/**
 * FrostUI-Editable v1.1.1
 * https://github.com/elusivecodes/FrostUI-Editable
 */
(function(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory;
    } else {
        factory(global);
    }

})(window, function(window) {
    'use strict';

    if (!window) {
        throw new Error('FrostUI-Editable requires a Window.');
    }

    if (!('UI' in window)) {
        throw new Error('FrostUI-Editable requires FrostUI.');
    }

    const Core = window.Core;
    const dom = window.dom;
    const UI = window.UI;

    // {{code}}
});