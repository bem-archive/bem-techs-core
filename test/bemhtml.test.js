var sinon = require('sinon'),
    chai = require('chai'),
    BEMSmoke = require('bem-smoke');


chai.use(require('sinon-chai'));
var expect = chai.expect;

describe('bemhtml.js tech', function() {
    var tech;
    beforeEach(function() {
        tech = BEMSmoke.testTech(require.resolve('../techs/bemhtml.js'));
    });

    describe('build', function() {
        beforeEach(function() {
            tech.withMockedModules({
                '../lib/bemhtml': {
                    translate: function(sources) {
                        return 'compiled:\n' + sources;
                    }
                }
            });
        });

        it('produces bemhtml files for block', function(done) {
            tech.withSourceFiles({
                'block': {
                    'block.bemhtml.xjst': 'block' 
                }
            })
            .build('/out', {
                deps: [ 
                    {block: 'block'}
                ]
            })
            .producesFile('/out.bemhtml.js')
            .withContent('compiled:',
                         '',
                         '/* begin: block/block.bemhtml.xjst */',
                         'block',
                         '/* end: block/block.bemhtml.xjst */',
                         '')
            .notify(done);
        });


        it('produces bemhtml files for multiple blocks', function(done) {
            tech.withSourceFiles({
                'block1': {
                    'block1.bemhtml.xjst': 'block1' 
                },
                'block2': {
                    'block2.bemhtml.xjst': 'block2' 
                }
            })
            .build('/out', {
                deps: [ 
                    {block: 'block1'},
                    {block: 'block2'}
                ]
            })
            .producesFile('/out.bemhtml.js')
            .withContent('compiled:',
                         '',
                         '/* begin: block1/block1.bemhtml.xjst */',
                         'block1',
                         '/* end: block1/block1.bemhtml.xjst */',
                         '',
                         '',
                         '/* begin: block2/block2.bemhtml.xjst */',
                         'block2',
                         '/* end: block2/block2.bemhtml.xjst */',
                         '')
            .notify(done);
        });
        
        it('produces bemhtml files for block and block mod', function(done) {
            tech.withSourceFiles({
                'block': {
                    'block.bemhtml.xjst': 'block',
                    '_mod': {
                        'block_mod_val.bemhtml.xjst': 'block, mod=val'
                    }
                }
            })
            .build('/out', {
                deps: [ 
                    {block: 'block'},
                    {block: 'block', mod: 'mod', val: 'val'}
                ]
            })
            .producesFile('/out.bemhtml.js')
            .withContent('compiled:',
                         '',
                         '/* begin: block/block.bemhtml.xjst */',
                         'block',
                         '/* end: block/block.bemhtml.xjst */',
                         '',
                         '',
                         '/* begin: block/_mod/block_mod_val.bemhtml.xjst */',
                         'block, mod=val',
                         '/* end: block/_mod/block_mod_val.bemhtml.xjst */',
                         '')
            .notify(done);
        });

        it('produces bemhtml files for block and elem', function(done) {
            tech.withSourceFiles({
                'block': {
                    'block.bemhtml.xjst': 'block',
                    '__elem': {
                        'block__elem.bemhtml.xjst': 'block, elem'
                    }
                }
            })
            .build('/out', {
                deps: [ 
                    {block: 'block'},
                    {block: 'block', elem: 'elem'}
                ]
            })
            .producesFile('/out.bemhtml.js')
            .withContent('compiled:',
                         '',
                         '/* begin: block/block.bemhtml.xjst */',
                         'block',
                         '/* end: block/block.bemhtml.xjst */',
                         '',
                         '',
                         '/* begin: block/__elem/block__elem.bemhtml.xjst */',
                         'block, elem',
                         '/* end: block/__elem/block__elem.bemhtml.xjst */',
                         '')
            .notify(done);
        });


        it('produces bemhtml files for block, elem and elem mod', function(done) {
            tech.withSourceFiles({
                'block': {
                    'block.bemhtml.xjst': 'block',
                    '__elem': {
                        'block__elem.bemhtml.xjst': 'block, elem',
                        '_mod': {
                            'block__elem_mod_val.bemhtml.xjst': 'block, elem, mod=val' 
                        }
                    }
                }
            })
            .build('/out', {
                deps: [ 
                    {block: 'block'},
                    {block: 'block', elem: 'elem'},
                    {block: 'block', elem: 'elem', mod: 'mod', val: 'val'}
                ]
            })
            .producesFile('/out.bemhtml.js')
            .withContent('compiled:',
                         '',
                         '/* begin: block/block.bemhtml.xjst */',
                         'block',
                         '/* end: block/block.bemhtml.xjst */',
                         '',
                         '',
                         '/* begin: block/__elem/block__elem.bemhtml.xjst */',
                         'block, elem',
                         '/* end: block/__elem/block__elem.bemhtml.xjst */',
                         '',
                         '',
                         '/* begin: block/__elem/_mod/block__elem_mod_val.bemhtml.xjst */',
                         'block, elem, mod=val',
                         '/* end: block/__elem/_mod/block__elem_mod_val.bemhtml.xjst */',
                         '')
            .notify(done);
        });

        it('produces bemhtml files on multiple levels', function(done) {
            tech.withSourceFiles({
                'level1': {
                    'block': {
                        'block.bemhtml.xjst': 'l1',
                    }
                },
                'level2': {
                    'block': {
                        'block.bemhtml.xjst': 'l2'
                    }
                }
            })
            .withLevels([
                '/level1',
                '/level2'
            ])
            .build('/out', {
                deps: [
                    {block: 'block'}
                ]
            })
            .producesFile('/out.bemhtml.js')
            .withContent('compiled:',
                         '',
                         '/* begin: level1/block/block.bemhtml.xjst */',
                         'l1',
                         '/* end: level1/block/block.bemhtml.xjst */',
                         '',
                         '',
                         '/* begin: level2/block/block.bemhtml.xjst */',
                         'l2',
                         '/* end: level2/block/block.bemhtml.xjst */',
                         '')
            .notify(done);
        });
    });

    describe('transpiling', function() {
        var mockCompat;
        beforeEach(function() {
            mockCompat = {
                transpile: sinon.spy()
            };

            tech.withMockedModules({
                'bemhtml-compat': mockCompat
            });
        });
        
        it('is performed for *.bemhtml file', function(done) {
            tech.withSourceFiles({
                'block': {
                    'block.bemhtml': 'block'
                }
            })
            .build('/out', {
                deps:[
                    {block: 'block'}
                ]
            })
            .asserts(function() {
                expect(mockCompat.transpile).to.have.been.calledWith('block');
            })
            .notify(done);
        });


        it('does not performed for *.bemhtml.xjst file', function(done) {
            tech.withSourceFiles({
                'block': {
                    'block.bemhtml.xjst': 'block'
                }
            })
            .build('/out', {
                deps:[
                    {block: 'block'}
                ]
            })
            .asserts(function() {
                expect(mockCompat.transpile).not.to.have.been.called();
            })
            .notify(done);
        });
    });

    describe('build flags', function() {
        var mockBemHtml;
        beforeEach(function() {
            mockBemHtml = {
                translate: sinon.spy()
            };

            tech.withMockedModules({
                '../lib/bemhtml': mockBemHtml
            })
            .withSourceFiles({
                'block': {
                    'block.bemhtml.xjst': 'block'
                }
            });
        });

        describe('debug mode', function() {

            afterEach(function() {
                delete process.env.BEMHTML_ENV;
            });

            it('gets trigerred when env var BEMHTML_ENV=development', function(done) {
                process.env.BEMHTML_ENV = 'development';
                tech.build('/out', {
                    deps: [
                        {block: 'block'}
                    ]
                })
                .asserts(function() {
                    expect(mockBemHtml.translate).to.have.been.calledWith(sinon.match.any,
                                                                          sinon.match({devMode: true}));
                })
                .notify(done);
            });

            it('does not gets triggered when BEMHTML_ENV!=development', function(done) {
                process.env.BEMHTML_ENV = 'production';
                tech.build('/out', {
                    deps: [
                        {block: 'block'}
                    ]
                })
                .asserts(function() {
                    expect(mockBemHtml.translate).to.have.been.calledWith(sinon.match.any,
                                                                          sinon.match({devMode: false}));
                })
                .notify(done);
            });
        });

        describe('cache', function() {
            afterEach(function() {
                delete process.env.BEMHTML_CACHE;
            });

            it('gets used when env var BEMHTML_CACHE==on', function(done) {
                process.env.BEMHTML_CACHE = 'on';

                tech.build('/out', {
                    deps: [
                        {block: 'block'}
                    ]
                })
                .asserts(function() {
                    expect(mockBemHtml.translate).to.have.been.calledWith(sinon.match.any,
                                                                          sinon.match({cache: true}));
                })
                .notify(done);
            });

            it('does not used when env var BEMHTML_CACHE==on', function(done) {
                process.env.BEMHTML_CACHE = 'off';

                tech.build('/out', {
                    deps: [
                        {block: 'block'}
                    ]
                })
                .asserts(function() {
                    expect(mockBemHtml.translate).to.have.been.calledWith(sinon.match.any,
                                                                          sinon.match({cache: false}));
                })
                .notify(done);
            });
        });
    });
    
});


