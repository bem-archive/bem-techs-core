'use strict';

var BEMSmoke = require('bem-smoke'),
    expect = require('chai').expect,
    sinon = require('sinon');

describe('bemtree tech', function() {
    var tech;
    beforeEach(function() {
        tech = BEMSmoke.testTech(require.resolve('../techs/bemtree.js'));
    });

    describe('create', function() {
        it('produces .bemtree file', function(done) {
            tech.create({
                block: 'block'
            })
            .producesFile('/block/block.bemtree')
            .notify(done);
        });
    });

    describe('build', function() {
        beforeEach(function() {
            tech.withSourceFiles({
                'block': {
                    'block.bemtree': 'source'
                }
            });
        });

        it('compiles bemtree as bemhtml', function(done) {
            tech.withMockedModules({
                '../lib/bemhtml': {
                    translate: sinon.stub().returns('compiled')
                }
            })
            .build('/out', {
                deps: [
                    {block: 'block'}
                ]
            })
            .producesFile('/out.bemtree.js')
            .withContent('compiled')
            .notify(done);
        });

        describe('flags', function() {
            var mockBemHtml;
            beforeEach(function() {
                mockBemHtml = {
                    translate: sinon.spy()
                };

                tech.withMockedModules({
                    '../lib/bemhtml': mockBemHtml
                });
            });

            it('exportName===BEMTREE', function(done) {
                tech.build('/out', {
                    deps: [
                        {block: 'block'}
                    ]
                })
                .asserts(function() {
                    expect(mockBemHtml.translate).to.be.calledWith(sinon.match.any,
                                                                  sinon.match({exportName: 'BEMTREE'}));
                })
                .notify(done);
                
            });

            describe('devMode', function() {
                afterEach(function() {
                    delete process.env.BEMTREE_ENV;
                });

                it('===true when env var BEMTREE_ENV=development', function(done) {
                    process.env.BEMTREE_ENV = 'development';
                    tech.build('/out', {
                        deps: [
                            {block: 'block'}
                        ]
                    })
                    .asserts(function() {
                        expect(mockBemHtml.translate).to.be.calledWith(sinon.match.any,
                                                                      sinon.match({devMode: true}));
                    })
                    .notify(done);
                });


                it('===false when env var BEMTREE_ENV!==development', function(done) {
                    process.env.BEMTREE_ENV = 'production';
                    tech.build('/out', {
                        deps: [
                            {block: 'block'}
                        ]
                    })
                    .asserts(function() {
                        expect(mockBemHtml.translate).to.be.calledWith(sinon.match.any,
                                                                      sinon.match({devMode: false}));
                    })
                    .notify(done);
                });
            });
        });
    });
});
