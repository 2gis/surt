var assert = require('assert'),
    _ = require('underscore');

describe('Парсер текста.', function() {
    var ui = require('./ui');

    it('UI есть', function() {
        assert(ui && typeof ui == 'function');
    });

    it('В прототипе есть методы set и get', function() {
        var surt = ui({});

        //assert(surt);
    });
});