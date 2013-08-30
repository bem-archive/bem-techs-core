'use strict';
var BEMSmoke = require('bem-smoke');

var decl = {
    deps: [
        {block: 'block'}
    ]
};

describe('i18n.node.js tech', function(done) {
    var tech;
    beforeEach(function() {
        tech = BEMSmoke.testTech(require.resolve('../techs/i18n.node.js.js'));
        tech.withSourceFiles({
            'ym': {
                'ym.js': '//ym chunk'
            },

            'block': {
                'block.node.js': '//node'
            },

            'out.i18n': {
                'all.js': '({"en": {"block": {"test": "test"}}})'
            }
        })
        .withTechMap({
            'node.js': require.resolve('../techs/node.js.js'),
            'vanilla.js': require.resolve('../techs/vanilla.js.js'),
            'js': require.resolve('bem/lib/techs/v2/js.js')
        })
        .build('/out', decl)
        .notify(done);
    });

    it('builds browser.js with appended i18n keys', function(done) {
        tech.producesFile('/out.en.node.js')
        .withContent('if(typeof module !== "undefined") {modules = require("ym");}',
                     '/* block/block.node.js: begin */ /**/',
                     '//node;',
                     '/* block/block.node.js: end */ /**/',
                     '',
                     '',
                     'BEM.I18N.decl("block", {"test": "test"}, {',
                     '"lang": "en"',
                     '});',
                     '',
                     'BEM.I18N.lang("en");',
                     '')
        .notify(done);
    });

    it('not invalidates when nothing changed', function(done) {
        tech.build('/out', decl)
            .notWritesToFile('/out.en.node.js')
            .notify(done);
    });

    it('invlidates when i18n files changed', function(done) {
        tech.touchFile('/out.i18n/all.js')
            .build('/out', decl)
            .writesToFile('/out.en.node.js')
            .notify(done);
    });

    it('invlidates when js files changed', function(done) {
        tech.touchFile('block/block.browser.js')
            .build('/out', decl)
            .writesToFile('/out.en.node.js')
            .notify(done);
    });
});

