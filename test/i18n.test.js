'use strict';
var BEMSmoke = require('bem-smoke');

var decl = {
    deps: [
        {block: 'block'}
    ]
};

describe('i18n tech', function() {
    var tech;
    beforeEach(function(done) {
        tech = BEMSmoke.testTech(require.resolve('../techs/i18n.js'));
        tech.withSourceFiles({
            'block': {
                'block.i18n': {
                    'ru.js': 'module.exports = {"block": {"test": "тест"}}',
                    'en.js': 'module.exports = {"block": {"test": "test"}}'
                }
            }
        })
        .build('/out', decl)
        .notify(done);
    });

    it('creates all.js from languages files', function(done) {
        
        tech.producesFile('/out.i18n/all.js')
        .withContent(['(',
                      JSON.stringify({
                         ru: {
                             block: {
                                 test: 'тест'
                             }
                         },

                         en: {
                             block: {
                                 test: 'test'
                             }
                         }
                      }, null, 4),
                    ')\n'].join(''))
        .notify(done);
    });

    it('does not invalidates when no files changed', function(done) {
        tech.build('/out', decl)
            .notWritesToFile('/out.i18n/all.js')
            .notify(done);
    });

    it('invalidates when one of the lang files changed', function(done) {
        tech.touchFile('/block/block.i18n/en.js')
            .build('/out', decl)
            .writesToFile('/out.i18n/all.js')
            .notify(done);
    });
});
