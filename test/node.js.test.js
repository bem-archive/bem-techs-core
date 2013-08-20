'use strict';

var BEMSmoke = require('bem-smoke');

describe('node.js tech', function() {
    var tech;

    beforeEach(function() {
        tech = BEMSmoke.testTech(require.resolve('../techs/node.js.js'))
                       .withTechMap({
                           'js': require.resolve('bem/lib/techs/v2/js.js'),
                           'vanilla.js': require.resolve('../techs/vanilla.js.js')
                       });
    });

    it('should add ym import to the base tech build result', function(done) {
        tech.withSourceFiles({
            'block': {
                'block.node.js': '//node'
            }
        })
        .build('/out', {
            deps: [
                {block: 'block'}
            ]
        })
        .producesFile('/out.node.js')
        .withContent('if(typeof module !== \'undefined\') {modules = require(\'ym\');}',
                     '/* block/block.node.js: begin */ /**/',
                     '//node;',
                     '/* block/block.node.js: end */ /**/',
                     '',
                     '')
        .notify(done);
    });

});
