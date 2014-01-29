describe('HTML.', function() {
    function reinit() {
        $('.wrapper_common').html(originalHTML);
        suggest = surt({
            root: '.surt',
            input: '.surt__input',
            suggest: '.surt__suggests',
            suggestItemCls: 'surt__suggests-item',
            suggestCls: 'surt_dropdown_true',
            tokenCls: 'surt__token',
            textCls: 'surt__text'
        });
    }
    
    before(function() {
        reinit();
    });

    var suggest;

    function getHTML() {
        return $('.surt__input').html() + $('.surt__clone-main').html() + $('.surt__clone-hint').html() + $('.surt__suggests').html();
    }

    describe('Метод set.', function() {
        it('Объект данных undefined', function() {
            suggest.set();

            var html = getHTML();
            assert(html == '', 'В отсутствии данных сагест не генерирует html (валится в Опере из-за restoreCursor)');
        });

        it('Пустой объек данных', function() {
            suggest.set({});

            var html = getHTML();
            assert(html == '', 'В отсутствии данных сагест не генерирует html');
        });

        it('Пустые кит и сагест', function() {
            suggest.set({
                kit: [],
                suggest: []
            });

            var html = getHTML();
            assert(html == '', 'В отсутствии данных сагест не генерирует html');
        });

        it('В ките есть несколько токенов, сагест пустой', function() {
            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'text'
                }, {
                    text: 'Wi-Fi',
                    type: 'filter'
                }, {
                    text: 'кухня',
                    type: 'attr'
                }, ],
                suggest: []
            });

            var html = getHTML();
            assert(html == '<div class="surt__text">Ресторан</div> <div class="surt__token _type_filter">Wi-Fi</div> <div class="surt__token _type_attr">кухня</div>', 'Генерирует html по киту из поисковой строки, в конце нет пробела');
        });

        it('Кит undefined, в сагесте один кит', function() {
            reinit();
            suggest.set({
                suggest: [[{
                    text: 'Ресторан',
                    type: 'text'
                }, {
                    text: 'Wi-Fi',
                    type: 'filter'
                }, {
                    text: 'кухня',
                    type: 'attr'
                }]]
            });

            var html = getHTML();
            assert.ok(html == '<li class="surt__suggests-item"><div class="surt__text">Ресторан</div> <div class="surt__token _type_filter">Wi-Fi</div> <div class="surt__token _type_attr">кухня</div></li>');
        });

        it('Кит + 2 сагеста', function() {
            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'text'
                }],
                suggest: [
                [{
                        text: 'Ресторан',
                        type: 'text'
                    }, {
                        text: 'Wi-Fi',
                        type: 'filter'
                    }, {
                        text: 'кухня',
                        type: 'attr'
                    }
                ], [{
                        text: 'Ресторан',
                        type: 'text'
                    }, {
                        text: 'Wi-Fi',
                        type: 'filter'
                    }, {
                        text: 'Абра ка дабра',
                        type: 'attr'
                    }]
                ]
            });

            var html = getHTML();
            assert.ok(html == '<div class="surt__text">Ресторан</div><li class="surt__suggests-item"><div class="surt__text">Ресторан</div> <div class="surt__token _type_filter">Wi-Fi</div> <div class="surt__token _type_attr">кухня</div></li><li class="surt__suggests-item"><div class="surt__text">Ресторан</div> <div class="surt__token _type_filter">Wi-Fi</div> <div class="surt__token _type_attr">Абра ка дабра</div></li>');
        });

        it('Кит не передается в set - должен остаться старый кит', function() {
            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'text'
                }],
                suggest: [
                    [{
                        text: 'Ресторан',
                        type: 'text'
                    }], [{
                        text: 'Ресторан',
                        type: 'text'
                    }]
                ]
            });

            var oldHtml = $('.surt__input').html(),
                oldPos = 3;

            suggest.restoreCursor(oldPos);

            suggest.set({
                suggest: [
                    [{
                        text: 'Ресторан',
                        type: 'text'
                    }], [{
                        text: 'Ресторан',
                        type: 'text'
                    }]
                ]
            });

            var newHtml = $('.surt__input').html(),
                newPos = suggest.getCursor();

            assert(oldHtml == newHtml, 'HTML код в инпуте не изменился');
            assert(oldPos == newPos, 'Позиция курсора в инпуте не изменилась');
        });

        // Трим токенов в ПС, в сагесте, текст, не текст

        it('Кит передан объектом', function() {
            $('.surt__input').html('');

            suggest.set({
                kit: [],
                suggest: []
            });
            suggest.set({
                kit: {
                    text: 'Ресторан',
                    type: 'text'
                },
                suggest: [
                [{
                        text: 'Ресторан',
                        type: 'text'
                    }, {
                        text: 'Wi-Fi',
                        type: 'filter'
                    }, {
                        text: 'кухня',
                        type: 'attr'
                    }
                ], [{
                        text: 'Ресторан',
                        type: 'text'
                    }, {
                        text: 'Wi-Fi',
                        type: 'filter'
                    }, {
                        text: 'Абра ка дабра',
                        type: 'attr'
                    }]
                ]
            });

            var html = getHTML();
            assert.ok(html == '<div class="surt__text">Ресторан</div><li class="surt__suggests-item"><div class="surt__text">Ресторан</div> <div class="surt__token _type_filter">Wi-Fi</div> <div class="surt__token _type_attr">кухня</div></li><li class="surt__suggests-item"><div class="surt__text">Ресторан</div> <div class="surt__token _type_filter">Wi-Fi</div> <div class="surt__token _type_attr">Абра ка дабра</div></li>');
        });

        it('Изменение крайнего кита -> сброс его в тип text', function() {
            var e;

            $('.wrapper').html(originalHTML);
            suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                change: function(e, data) {
                    suggest.set({
                        kit: data.kit
                    });
                }
            });

            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'rubric'
                }, {
                    text: 'wifi',
                    type: 'filter'
                }]
            });

            suggest.restoreCursor(8);

            // Backspace
            $('.surt__input').html('<div class="surt__token _type_rubric">Ресторан</div> <div class="surt__token _type_filter">wif</div>');
            e = jQuery.Event('keydown');
            e.keyCode = 8;
            $('.surt__input').trigger(e); // Down
            e = jQuery.Event('keyup');
            e.keyCode = 8;
            $('.surt__input').trigger(e); // Up

            var html = $('.surt__input').html();
            assert.ok(html == '<div class="surt__token _type_rubric">Ресторан</div> <div class="surt__text">wif</div>');
        });

        it('В ките был 1 токен, сетим 2 токена', function() {
            reinit();

            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'rubric'
                }]
            });

            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'rubric'
                }, {
                    text: 'wifi',
                    type: 'filter'
                }]
            });
        });

        it('В ките было 2 токена, сетим 1 токен', function() {
            reinit();

            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'rubric'
                }, {
                    text: 'wifi',
                    type: 'filter'
                }]
            });

            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'rubric'
                }]
            });
        });

        it('Выставляет модификатор count при наличии', function() {
            $('.wrapper_common').html(originalHTML);
            suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                suggestItemCountCls: 'count_mod_'
            });

            suggest.set({
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }, {
                    text: 'wifi',
                    type: 'filter'
                }]]
            });

            assert($('.surt__suggests .surt__suggests-item').eq(0).hasClass('count_mod_2'), 'Есть класс-модификатор count_mod_2');
        });
    });

    describe('Метод parse', function() {
        before(function() {
            reinit();
        });

        it('this.kit undefined', function() {
            suggest.set();
            suggest.parse();
        });
    });

    describe('Метод invalidate', function() {
        before(function() {
            reinit();
        });

        it('Кастомный текст для инвалидации', function() {
            suggest.invalidate('Рестораны вася');

            assert.deepEqual(suggest.kit, [{
                text: 'Рестораны вася',
                type: 'text'
            }], 'В кит выставился кастомный текст и ничего более');
        });
    });
});