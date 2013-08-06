var BEMSmoke = require('bem-smoke');

describe('vanilla.js tech', function() {
    var tech;
    beforeEach(function() {
        tech = BEMSmoke.testTech(require.resolve('../lib/vanilla.js.js'))
                       .withTechMap({
                           'js': require.resolve('bem/lib/techs/v2/js.js')
                       });
    });

    describe('create', function() {
        function testCreate(params) {
            tech.create(params.create)
            .producesFile(params.expectedFile)
            .withContent('/*global modules:false */',
                         '',
                         'modules.define(\'' + params.expectedId + '\', function(provide) {',
                         '',
                         '});',
                         '',
                         '')
            .notify(params.notify);
        }

        it('produces modular js for block', function(done) {
            testCreate({
                create: {
                    block: 'block'
                },

                expectedFile: 'block/block.vanilla.js',
                expectedId: 'block',
                notify: done
            });
        });

        it('produces modular js for block and elem', function(done) {
            testCreate({
                create: {
                    block: 'block',
                    elem: 'elem'
                },
                expectedFile: 'block/__elem/block__elem.vanilla.js',
                expectedId: 'block__elem',
                notify: done
            });
        });

        it('produces modular js for block and block mod', function(done) {
            testCreate({
                create: {
                    block: 'block',
                    mod: 'mod',
                    val: 'val'
                },
                expectedFile: 'block/_mod/block_mod_val.vanilla.js',
                expectedId: 'block_mod_val',
                notify: done
            });
        });

        it('produces modular js for block, elem and elem mod', function(done) {
            testCreate({
                create: {
                    block: 'block',
                    elem: 'elem',
                    mod: 'mod',
                    val: 'val'
                },
                expectedFile: 'block/__elem/_mod/block__elem_mod_val.vanilla.js',
                expectedId: 'block__elem_mod_val',
                notify: done
            });
        });
    });

    describe('build', function() {
        it('produces concatenated js file the same way as base tech', function (done) {
            tech.withSourceFiles({
                'block': {
                    'block.vanilla.js': '//block',
                    '__elem': {
                        'block__elem.vanilla.js': '//elem'
                    }
                }
            })
            .build('/out', {
                deps: [
                    {block: 'block'},
                    {block: 'block', elem: 'elem'}
                ]
            })
            .producesFile('/out.vanilla.js')
            .withContent('/* block/block.vanilla.js: begin */ /**/',
                         '//block;',
                         '/* block/block.vanilla.js: end */ /**/',
                         '',
                         '/* block/__elem/block__elem.vanilla.js: begin */ /**/',
                         '//elem;',
                         '/* block/__elem/block__elem.vanilla.js: end */ /**/',
                         '',
                         '')
            .notify(done);
        });
    });
});
