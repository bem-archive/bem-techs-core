# Bem Core Tech Modules

[![Build Status](https://travis-ci.org/bem/bem-techs-core.png)](https://travis-ci.org/bem/bem-techs-core)

A set of core technology modules not included in [bem-tools](https://github.com/bem/bem-tools) distribution.

## Technologies included

* bemhtml;
* bemtree;
* vanilla.js;
* node.js;
* browser.js;
* browser.js+bemhtml;
* html;
* md;

## Usage

1.  Install via `npm`:

    ```
    npm install bem-core-techs
    ```
2.  Configure your `level.js` to use technologies from a package:

    ```javascript
    var coreTechs = require('bem-core-techs')

    exports.getTechs = function() {
        return {
            //your setup code
            'bemhtml': coreTechs.resolveTech('bemhtml'),
            'vanilla.js': coreTechs.resolveTech('vanilla.js')
        }
    };
    ```

