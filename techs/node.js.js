'use strict';

exports.baseTechName = 'vanilla.js';

exports.techMixin = {

    getSuffixes : function() {
        return ['vanilla.js', 'node.js'];
    },

    getCreateSuffixes : function() {
        return ['node.js'];
    },

    getBuildSuffixes : function() {
        return ['node.js'];
    },

    getBuildSuffixesMap : function() {
        return {
            'node.js' : this.getSuffixes()
        };
    },

    getYmChunk : function() {
        return [
            'if(typeof module !== "undefined") {',
            'modules = require("ym");',
            '}\n'
        ].join('');
    },

    getBuildResult : function(files, suffix, output, opts) {
        var ymChunk = this.getYmChunk();
        return this.__base(files, suffix, output, opts)
            .then(function(res) {
                return [ymChunk].concat(res);
            });
    }

};
