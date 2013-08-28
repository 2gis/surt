var assert = require('assert');

describe('Парсер текста.', function() {
    var parser = require('./parser');

    parser.trim = function(text) {
        return text.trim();
    };

    it('Парсер есть', function() {
        assert(parser && typeof parser == 'function');
    });

    it('Пустой сет и текст возвращают пустой сет', function() {
        var kit = [],
            text = '',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, []);
    });

    it('Текст соответствует сету', function() {
        var kit = [{
                text: 'Ресторан',
                type: 'rubric'
            }, {
                text: 'Wi-Fi',
                type: 'filter'
            }],
            text = 'Ресторан Wi-Fi',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, kit);
    });

    it('Текст частично не соответствует сету', function() {
        var kit = [{
                text: 'Ресторан',
                type: 'rubric'
            }, {
                text: 'Wi-Fi',
                type: 'filter'
            }],
            text = 'Ресторан Wi-F',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, [kit[0], {
            text: 'Wi-F',
            type: 'text'
        }]);
    });

    it('Текст вообще никак не соответствует сету', function() {
        var kit = [{
                text: 'Ресторан',
                type: 'rubric'
            }, {
                text: 'Wi-Fi',
                type: 'filter'
            }],
            text = 'Рестора Wi-F',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, [{
            text: 'Рестора Wi-F',
            type: 'text'
        }]);
    });

    it('Выпиливание текста из центральных токенов', function() {
        var kit = [{
                text: 'Ресторан',
                type: 'rubric'
            }, {
                text: 'Wi-Fi',
                type: 'filter'
            }, {
                text: 'лыжи',
                type: 'attr'
            }],
            text = 'Ресторан W лыжи',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, [kit[0], {
            text: 'W',
            type: 'text'
        }, kit[2]]);
    });

    it('Выпиливание текста задевает первый токен', function() {
        var kit = [{
                text: 'Ресторан',
                type: 'rubric'
            }, {
                text: 'Wi-Fi',
                type: 'filter'
            }, {
                text: 'лыжи',
                type: 'attr'
            }],
            text = 'Ресто-Fi лыжи',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, [{
            text: 'Ресто-Fi',
            type: 'text'
        }, kit[2]]);
    });

    it('Выпиливание текста задевает последний токен', function() {
        var kit = [{
                text: 'Ресторан',
                type: 'rubric'
            }, {
                text: 'Wi-Fi',
                type: 'filter'
            }, {
                text: 'лыжи',
                type: 'attr'
            }],
            text = 'Ресторан Fiыжи',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, [kit[0], {
            text: 'Fiыжи',
            type: 'text'
        }]);
    });

    it('Выпиливание текста задевает несколько не соседних токенов + несколько пробелов', function() {
        var kit = [{
                text: 'Ресторан',
                type: 'rubric'
            }, {
                text: 'Wi-Fi',
                type: 'filter'
            }, {
                text: 'лыжи',
                type: 'attr'
            }, {
                text: 'gprs',
                type: 'internet'
            }],
            text = 'Ресторан Fi лыжи   gs',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, [kit[0], {
            text: 'Fi',
            type: 'text'
        }, kit[2], {
            text: 'gs',
            type: 'text'
        }]);
    });

    it('Объединяет текстовые токены с пробелом', function() {
        var kit = [{
                text: 'Ресторан',
                type: 'rubric'
            }, {
                text: 'лыжи',
                type: 'text'
            }, {
                text: 'Wi-Fi',
                type: 'filter'
            }, {
                text: 'gprs',
                type: 'text'
            }],
            text = 'Ресторан лыжи gprs',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, [{
            text: 'Ресторан',
            type: 'rubric'
        }, {
            text: 'лыжи gprs',
            type: 'text'
        }]);
    });

    it('Объединяет текстовые токены без пробела', function() {
        var kit = [{
                text: 'а',
                type: 'text'
            }],
            text = 'аб',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, [{
            text: 'аб',
            type: 'text'
        }]);
    });

    it('Trailing space', function() {
        var kit = [{
                text: 'а',
                type: 'text'
            }],
            text = 'а ',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, [{
            text: 'а',
            type: 'text'
        }]);
    });

    it('Trailing space для сложных типов токенов', function() {
        var kit = [{
                text: 'Warren',
                type: 'rubric'
            }],
            text = 'Warren ',
            result = parser.call(parser, kit, text);

        assert.deepEqual(result, [{
            text: 'Warren',
            type: 'rubric'
        }]);
    });

    it('regexp', function() {
        var html = 'рестораны',
            partial = 'ест',
            expected;

        obj = {
            params: {
                selectionCls: 'cls'
            },
            text: function() {
                return partial;
            }
        };

        // Обычный текст
        var expected = parser.replace.call(obj, html);
        assert(expected == 'р<span class="cls">ест</span>ораны', 'text');

        // Шаримся внутри html
        html = '<div class="token">рестораны</div>';
        expected = parser.replace.call(obj, html);
        assert(expected == '<div class="token">р<span class="cls">ест</span>ораны</div>', 'html');

        // Когда партиал есть внутри тега
        html = '<div class="token" data="рестораны">рестораны</div>';
        expected = parser.replace.call(obj, html);
        assert(expected == '<div class="token" data="рестораны">р<span class="cls">ест</span>ораны</div>', 'html + tag');

        html = '<span data="рестораны"></span><div class="token" data="рестораны">рестораны</div>';
        expected = parser.replace.call(obj, html);
        assert(expected == '<span data="рестораны"></span><div class="token" data="рестораны">р<span class="cls">ест</span>ораны</div>', 'html + tag 2');
    });

    // it('Trailing nbsp space для сложных типов токенов', function() {
    //     var kit = [{
    //             text: 'Warren',
    //             type: 'rubric'
    //         }],
    //         text = 'Warren' + String.fromCharCode(160),
    //         result = parser(kit, text);

    //     assert.deepEqual(result, [{
    //         text: 'Warren',
    //         type: 'rubric'
    //     }]);
    // });

    // it('Токен undefined', function() {
    //     var text = 'Warren ',
    //         result = parser(undefined, text);

    //     assert.deepEqual(result, [{
    //         text: 'Warren ',
    //         type: 'text'
    //     }]);
    // });
});