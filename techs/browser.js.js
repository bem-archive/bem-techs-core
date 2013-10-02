'use strict';

var dbg = 0;
var PATH = require('path'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    ymPath = require.resolve('ym'),
    __assert = require('assert'),
    Deps = require('bem/lib/techs/v2/deps.js').Deps;

exports.baseTechName = 'vanilla.js';

exports.techMixin = {

    getWeakBuildSuffixesMap:function(){
        return { 'js' : ['vanilla.js', 'browser.js', 'js'] };
    },

    getBuildSuffixesMap:function(){
        return { 'js' : ['browser.js', 'js'] };
    },
    
    getCreateSuffixes : function() {
        return ['browser.js'];
    },

    transformBuildDecl: function(decl, adjacentTechs) {
        var _this = this;

        var decl_ = decl.then(function(decl){
            if(!decl.depsFull) {
                return decl;
            }

            var depsGraph = new Deps().parseDepsDecl(decl);

            var includeTechs = {
                'browser.js': true,
                'vanilla.js': true
            };

            adjacentTechs = adjacentTechs || {};

            var adjacentRoots = [];
            Object.keys(adjacentTechs).forEach(function(tech){
                adjacentRoots[tech] = [];
            });

            var                 uniq = {
                'browser.js':{},
                'vanilla.js':{},
                '':{}
            };
            var items = [];
            _walkN([depsGraph.rootItem.buildKey()], 'browser.js');

            return {deps:items,
              adjacentRoots:adjacentRoots};

            function _walkN(keys, buildTech){
                keys.forEach(function(key){
                    if(!uniq[buildTech][key]){
                        uniq[buildTech][key] = 1;
dbg && console.log('(walk',key);
                        var item = depsGraph.items[key];
                        var itemTech = item.item.tech;
                        if(!itemTech){
                            _walk1$(key, buildTech);
                        } else {
                            if (itemTech === buildTech) {
                                _walk1t(key, buildTech);
                            } else if (itemTech in includeTechs){
                                _walk1t(key, itemTech);
                            } else {
                                // skip item

dbg && console.log('(skip)');
                                if(itemTech in adjacentRoots){
dbg && console.log('(roots-push',key,')')
                                    adjacentRoots[itemTech].push(item)
                                }
                            }
                        }
dbg && console.log(')');
                    }
                })
            }

            function _walk1$(key, buildTech){
                var item = depsGraph.items[key];
                __assert(!item.item.tech);

                var item1 = item.clone();
                delete item1.key;
                item1.item.tech = buildTech;
                var key1 = item1.buildKey();
dbg && console.log('(walk-wild',key)
                if(depsGraph.items[key1] && !uniq[buildTech][key1]){
                    uniq[buildTech][key1] = 2;
                    __walk1t(key1, buildTech);
                }
                if(uniq[buildTech][key] === 1){
                    uniq[buildTech][key] = 2;
                    __walk1$(key, buildTech);
                }
dbg && console.log(')');
            }
            
            function _walk1t(key, buildTech){
                var item = depsGraph.items[key];
                __assert(item.item.tech);

                var item1 = item.clone();
                delete item1.key;
                delete item1.item.tech;
                var key1 = item1.buildKey();
dbg && console.log('(walk-tech',key);
                if(!uniq[buildTech][key] === 1){
                    uniq[buildTech][key] = 2;
                    __walk1t(key, buildTech);
                }
                if(depsGraph.items[key1] && !uniq[buildTech][key1]){
                    uniq[buildTech][key1] = 2;
                    __walk1$(key1, buildTech);
                }
dbg && console.log(')');
            }

            function __walk1$(key, buildTech){
                var item = depsGraph.items[key];
                __assert(item && !item.item.tech);
                _walkN(item.mustDeps, buildTech);
                _include(item, buildTech);
                _walkN(item.shouldDeps, buildTech);
            }

            function __walk1t(key, buildTech){
                var item = depsGraph.items[key];
                __assert(item && item.item.tech === buildTech);
                _walkN(item.mustDeps, buildTech);
                _include(item, buildTech);
                _walkN(item.shouldDeps, buildTech);
            }

            function _include(item, buildTech){
                var key = item.buildKey();
                if(uniq[buildTech][key] === 2){
                    uniq[buildTech][key] = 3;

                    if(!item.item.tech){
                        item = item.clone();
                        delete item.key;
                        item.item.tech = buildTech;
                        key = item.buildKey();
                    }
                    if(!uniq[''][key]){
                        uniq[''][key] = 1;
                        items.push(item.item);
dbg && console.log('(include',key,')');
                    }
                }
            }
        })

        decl_.done();
        return decl_;

    },

    getYmChunk : function(output) {
        var outputDir = PATH.resolve(output, '..');
        var ymRelPath = PATH.relative(outputDir, ymPath);
        return this.getBuildResultChunk(ymRelPath, ymPath);
    },

    getBuildResult : function(files, suffix, output) {
        return Q.all([
                this.getYmChunk(output),
                this.__base.apply(this, arguments)
            ])
            .spread(function(ym, res) {
                return [ym].concat(res);
            });
    }

};

