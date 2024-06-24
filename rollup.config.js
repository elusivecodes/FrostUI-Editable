'use strict';

import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'src/wrapper.js',
    output: {
        file: 'dist/frost-ui-editable.js',
        format: 'umd',
        globals: {
            '@fr0st/query': 'fQuery',
            '@fr0st/ui': 'UI',
            '@fr0st/ui-autocomplete': 'UI.Autocomplete',
            '@fr0st/ui-colorpicker': 'UI.ColorPicker',
            '@fr0st/ui-datetimepicker': 'UI.DateTimePicker',
            '@fr0st/ui-selectmenu': 'UI.SelectMenu',
        },
        name: 'UI',
        sourcemap: true,
        extend: true,
    },
    external: [
        '@fr0st/query',
        '@fr0st/ui',
        '@fr0st/ui-autocomplete',
        '@fr0st/ui-colorpicker',
        '@fr0st/ui-datetimepicker',
        '@fr0st/ui-selectmenu',
    ],
    plugins: [nodeResolve()],
};
