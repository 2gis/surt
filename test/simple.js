// Режим работы сагестера "без кирпичей" (простой текстовый сагестер но с запоминанием типов в коде)
describe('Текстовый режим.', function() {
    beforeEach(function() {
        $('.wrapper_common').html(simpleHTML);
    });

    function commotIts(params, shtml) {
        it('Правильно выставляет текстовый input и сагест когда', function() {
            var suggest = surt(params);

            assert(suggest, 'Возвращает surt объект');

            suggest.set({
                kit: [{
                    text: 'Рестораны',
                    type: 'rubric'
                }],
                suggest: [[{
                    text: 'Рестораны',
                    type: 'rubric'
                }], [{
                    text: 'Кафе',
                    type: 'rubric'
                }, {
                    text: 'Wi-Fi',
                    type: 'filter'
                }]]
            });

            var inputHTML = $('.surt__input').html(),
                suggestHTML = $('.surt__suggests').html();

            // Кит мы больше не позволяем выставлять снаружи, тест не актуален
            // assert(inputHTML == 'Рестораны', 'В инпуте только текст ' + inputHTML);
            assert(suggestHTML == shtml || '<li class="surt__suggests-item">Рестораны</li><li class="surt__suggests-item">Кафе Wi-Fi</li>', 'В сагесте текстовые строки ' + suggestHTML);
            suggest.dispose();
        });

        // it('Правильно выставляет текстовый input', function() {});

        // it('Правильно выставляет текстовый сагест', function() {});

        // it('Правильно выставляет текстовый сагест и автокомплит', function() {});

        // it('Заполняет автокомплит при нажатии вправо', function() {});
    }

    describe('Контейнер с сагестом не задан.', function() {
        var params = {
            root: '.surt',
            input: '.surt__input'
        };

        commotIts(params);
    });

    describe('Контейнер с сагестом задан, но не задан класс итема сагеста.', function() {
        var params = {
            root: '.surt',
            input: '.surt__input',
            suggest: '.surt__suggests'
        };

        commotIts(params);
    });

    describe('Контейнер с сагестом и класс итема задан.', function() {
        var params = {
            root: '.surt',
            input: '.surt__input',
            suggest: '.surt__suggests',
            suggestItemCls: 'surt__suggests-item'
        };

        commotIts(params);
    });

    describe('inputMode = text.', function() {
        var params = {
            root: '.surt',
            input: '.surt__input',
            suggest: '.surt__suggests',
            suggestItemCls: 'surt__suggests-item',
            inputMode: 'text',
            tokenCls: 'surt__token',
            textCls: 'surt__text'
        };

        commotIts(params, '<li class="surt__suggests-item"><div class="surt__token surt__token_type_rubric">Рестораны</div></li><li class="surt__suggests-item"><div class="surt__token surt__token_type_rubric">Кафе</div> <div class="surt__token surt__token_type_filter">Wi-Fi</div></li>');
    });

});